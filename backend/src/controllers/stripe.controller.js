const Stripe = require("stripe");
const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} = require("../config/env.config");
const planModel = require("../models/plan.model");
const EmailService = require("../services/email.service");
const SubscriptionService = require("../services/subscription.service");

const stripe = Stripe(STRIPE_SECRET_KEY);

const stripeWebhookHandler = async (req, res) => {
  // ====== Incoming Request Debug ======
  console.log("===== Stripe Webhook Hit =====");
  console.log("Request method:", req.method);
  console.log("Request path:", req.originalUrl || req.url);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log(
    "Stripe signature header (raw):",
    req.headers["stripe-signature"]
  );
  console.log(
    "STRIPE_WEBHOOK_SECRET prefix:",
    (STRIPE_WEBHOOK_SECRET || "").slice(0, 10)
  );
  console.log(
    "Raw body type:",
    typeof req.body,
    "instanceof Buffer:",
    req.body instanceof Buffer
  );

  const sig = req.headers["stripe-signature"];

  let event;
  try {
    console.log("Attempting to construct Stripe event from webhook...");
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Stripe event constructed successfully");
    console.log("Event ID:", event.id);
    console.log("Event type:", event.type);
    console.log(
      "Event livemode:",
      event.livemode,
      "| Created (unix):",
      event.created
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    console.error("Stack trace:", err.stack);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("➡ Handling event: checkout.session.completed");
        const session = event.data.object;
        console.log("Session ID:", session.id);
        console.log("Session mode:", session.mode);
        console.log("Session customer:", session.customer);
        console.log("Session subscription:", session.subscription);
        console.log("Session metadata:", session.metadata);

        // We only support one-time payment mode now
        if (session.mode !== "payment") {
          console.log(
            "checkout.session.completed in non-payment mode, ignoring.",
            { mode: session.mode }
          );
          break;
        }

        if (!session.customer) {
          console.warn(
            "checkout.session.completed has no customer, ignoring.",
            { sessionId: session.id }
          );
          break;
        }

        // Fetch customer (to get firebaseUid from metadata, email, etc.)
        let customer;
        try {
          console.log("Fetching Stripe customer for ID:", session.customer);
          customer = await stripe.customers.retrieve(session.customer);
          console.log("Stripe customer retrieved:", {
            id: customer.id,
            email: customer.email,
            metadata: customer.metadata,
          });
        } catch (err) {
          console.error("❌ Error retrieving customer:", err.message);
          console.error("Stack trace:", err.stack);
          break;
        }

        const firebaseUid = customer.metadata?.firebaseUid;
        console.log(
          "Extracted firebaseUid from customer.metadata:",
          firebaseUid
        );

        if (!firebaseUid) {
          console.warn(
            "⚠ firebaseUid missing in customer.metadata for checkout.session.completed",
            {
              customerId: customer.id,
            }
          );
          break;
        }

        // --- Resolve Plan ---
        let plan = null;

        // 1) Prefer planCode from session metadata (we set it in createCheckoutSessionForPlan)
        const planCode = session.metadata?.planCode;
        if (planCode) {
          console.log("Looking up Plan by code from session.metadata:", planCode);
          plan = await planModel.findOne({ code: planCode, isActive: true });
        }

        // 2) Fallback: derive priceId from line_items and map to plan.stripePriceId
        if (!plan) {
          try {
            console.log(
              "Plan not found by code, retrieving checkout session with line_items..."
            );
            const fullSession = await stripe.checkout.sessions.retrieve(
              session.id,
              { expand: ["line_items"] }
            );

            const priceId =
              fullSession.line_items?.data?.[0]?.price?.id || null;

            console.log("Derived priceId from checkout line_items:", priceId);

            if (priceId) {
              plan = await planModel.findOne({
                stripePriceId: priceId,
                isActive: true,
                code: { $ne: "INFINITE_ADMIN_PLAN" }
              });
            }
          } catch (err) {
            console.error(
              "❌ Error retrieving checkout.session with line_items:",
              err.message
            );
            console.error("Stack trace:", err.stack);
          }
        }

        if (!plan) {
          console.warn(
            "⚠ No Plan found for checkout.session.completed. Cannot create subscription record.",
            {
              planCode,
              sessionId: session.id,
            }
          );
          break;
        }

        console.log("Plan resolved for checkout:", {
          id: plan._id,
          name: plan.name,
          code: plan.code,
          stripePriceId: plan.stripePriceId,
        });

        // --- Upsert "subscription" (actually: plan purchase) in Mongo ---
        console.log(
          "Calling SubscriptionService.upsertPaidSubscriptionFromStripe with:",
          {
            firebaseUid,
            stripeCustomerId: customer.id,
            stripeSubscriptionId: null, // one-time payment -> no Stripe subscription
            planId: plan._id,
          }
        );

        const saved =
          await SubscriptionService.upsertPaidSubscriptionFromStripe({
            firebaseUid,
            stripeCustomerId: customer.id,
            stripeSubscriptionId: null,
            plan,
          });

        console.log("Subscription/plan record saved/updated in DB:", {
          id: saved && saved._id,
          firebaseUid: saved && saved.firebaseUid,
          plan: saved && saved.plan && saved.plan.code,
          isCurrent: saved && saved.isCurrent,
          isActive: saved && saved.isActive,
          status: saved && saved.status,
          currentPeriodStart: saved && saved.currentPeriodStart,
          currentPeriodEnd: saved && saved.currentPeriodEnd,
        });

        // --- Send purchase confirmation email ---
        if (customer.email) {
          const periodEnd = saved?.currentPeriodEnd || null;
          console.log(
            "Sending plan purchase confirmation email to:",
            customer.email
          );
          try {
            await EmailService.sendPlanPurchaseConfirmationEmail(
              customer.email,
              plan,
              periodEnd
            );
            console.log("✅ Plan purchase confirmation email sent.");
          } catch (err) {
            console.error(
              "❌ Error sending plan purchase confirmation email:",
              err.message
            );
            console.error("Stack trace:", err.stack);
          }
        } else {
          console.warn(
            "⚠ Customer email not found, skipping confirmation email."
          );
        }

        console.log(
          "✅ checkout.session.completed (payment mode) handled successfully."
        );
        break;
      }

      // You can leave invoice events here as future-proof no-ops for now
      case "invoice.payment_succeeded": {
        console.log(
          "➡ invoice.payment_succeeded received (no subscription flow in use now). No-op."
        );
        break;
      }

      case "invoice.payment_failed": {
        console.log(
          "➡ invoice.payment_failed received (no subscription flow in use now). No-op."
        );
        break;
      }

      default:
        console.log(`ℹ Unhandled event type "${event.type}". No-op for now.`);
        break;
    }

    console.log(
      "✅ Webhook processing completed. Responding with { received: true }"
    );
    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err.message);
    console.error("Stack trace:", err.stack);
    res.status(500).send("Webhook handler error");
  }
};

module.exports = stripeWebhookHandler;
