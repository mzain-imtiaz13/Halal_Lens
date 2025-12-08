const Stripe = require("stripe");
const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} = require("../config/env.config");
const planModel = require("../models/plan.model");
const EmailService = require("../services/email.service");
const SubscriptionService = require("../services/subscription.service");

const stripe = Stripe(STRIPE_SECRET_KEY);

// small helper
const unixToDate = (value) => {
  if (typeof value !== "number") return null;
  const d = new Date(value * 1000);
  return isNaN(d.valueOf()) ? null : d;
};

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
      req.body, // raw body (make sure express.raw is used for this route)
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
          // keep flow same: just break after logging
          break;
        }

        const firebaseUid = customer.metadata?.firebaseUid;
        const stripeSubscriptionId = session.subscription;

        console.log(
          "Extracted firebaseUid from customer.metadata:",
          firebaseUid
        );
        console.log(
          "Extracted stripeSubscriptionId from session:",
          stripeSubscriptionId
        );

        if (!firebaseUid || !stripeSubscriptionId) {
          console.warn(
            "⚠ Missing firebaseUid or stripeSubscriptionId in session/customer metadata",
            {
              firebaseUid,
              stripeSubscriptionId,
            }
          );
          break;
        }

        // Get full Stripe subscription
        let stripeSub;
        try {
          console.log(
            "Retrieving full Stripe subscription for ID:",
            stripeSubscriptionId
          );
          stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          console.log("Stripe subscription retrieved:", {
            id: stripeSub.id,
            status: stripeSub.status,
            current_period_start: stripeSub.current_period_start,
            current_period_end: stripeSub.current_period_end,
          });
        } catch (err) {
          console.error("❌ Error retrieving subscription:", err.message);
          console.error("Stack trace:", err.stack);
          break;
        }

        const priceId = stripeSub.items?.data?.[0]?.price?.id;
        console.log("Derived priceId from subscription items:", priceId);

        if (!priceId) {
          console.warn(
            "⚠ No priceId found on subscription items. Subscription items:",
            stripeSub.items?.data?.map((item) => ({
              id: item.id,
              price: item.price && {
                id: item.price.id,
                nickname: item.price.nickname,
              },
            }))
          );
          break;
        }

        console.log("Looking up Plan by stripePriceId:", priceId);
        const plan = await planModel.findOne({ stripePriceId: priceId });

        if (!plan) {
          console.warn(
            "⚠ No Plan found for priceId:",
            priceId,
            "– make sure stripePriceId is set on Plan."
          );
          break;
        }

        console.log("Plan found:", {
          id: plan._id,
          name: plan.name,
          stripePriceId: plan.stripePriceId,
        });

        const periodStart = unixToDate(stripeSub.current_period_start);
        const periodEnd = unixToDate(stripeSub.current_period_end);
        console.log("Computed billing period:", {
          periodStart,
          periodEnd,
        });

        console.log(
          "Calling SubscriptionService.upsertPaidSubscriptionFromStripe with:",
          {
            firebaseUid,
            stripeCustomerId: customer.id,
            stripeSubscriptionId,
            planId: plan._id,
          }
        );

        // ✅ Use new helper to ensure:
        // - this paid sub is isCurrent=true, isActive=true
        // - all previous subs have isCurrent=false
        const saved =
          await SubscriptionService.upsertPaidSubscriptionFromStripe({
            firebaseUid,
            stripeCustomerId: customer.id,
            stripeSubscriptionId,
            plan,
            periodStart,
            periodEnd,
          });

        console.log("Subscription saved/updated in DB:", {
          id: saved && saved._id,
          firebaseUid: saved && saved.firebaseUid,
          plan: saved && saved.plan,
          isCurrent: saved && saved.isCurrent,
          isActive: saved && saved.isActive,
          status: saved && saved.status,
        });

        // Send purchase confirmation email
        if (customer.email) {
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
          "✅ checkout.session.completed handled successfully, subscription ID:",
          saved && saved._id
        );
        break;
      }
      case "invoice.payment_succeeded": {
        console.log("➡ Handling event: invoice.payment_succeeded");
        const invoice = event.data.object;

        console.log("Invoice ID:", invoice.id);
        console.log("Invoice subscription:", invoice.subscription);
        console.log("Invoice customer:", invoice.customer);

        const stripeCustomerId = invoice.customer;

        // Get billing period from invoice line
        const line = invoice.lines?.data?.[0];
        if (!line || !line.period) {
          console.warn(
            "⚠ No line.period on invoice, cannot derive billing period"
          );
          break;
        }

        const periodStart = unixToDate(line.period.start);
        const periodEnd = unixToDate(line.period.end);

        console.log("Derived billing period from invoice:", {
          rawStart: line.period.start,
          rawEnd: line.period.end,
          periodStart,
          periodEnd,
        });

        // Fetch customer to get firebaseUid from metadata
        let customer;
        try {
          console.log("Fetching Stripe customer for ID:", stripeCustomerId);
          customer = await stripe.customers.retrieve(stripeCustomerId);
          console.log("Stripe customer retrieved (for invoice):", {
            id: customer.id,
            email: customer.email,
            metadata: customer.metadata,
          });
        } catch (err) {
          console.error(
            "❌ Error retrieving customer in invoice.payment_succeeded:",
            err.message
          );
          console.error("Stack trace:", err.stack);
          break;
        }

        const firebaseUid = customer.metadata?.firebaseUid;
        if (!firebaseUid) {
          console.warn(
            "⚠ firebaseUid missing in customer.metadata for invoice.payment_succeeded"
          );
          break;
        }

        // ✅ Get the active subscription for this customer
        let stripeSub;
        try {
          console.log(
            "Listing active subscriptions for customer in invoice.payment_succeeded..."
          );
          const subs = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: "active",
            limit: 1,
          });

          stripeSub = subs.data[0];
          if (!stripeSub) {
            console.warn(
              "⚠ No active subscription found for customer in invoice.payment_succeeded"
            );
            break;
          }

          console.log(
            "Active subscription from list (invoice.payment_succeeded):",
            {
              id: stripeSub.id,
              status: stripeSub.status,
              current_period_start: stripeSub.current_period_start,
              current_period_end: stripeSub.current_period_end,
            }
          );
        } catch (err) {
          console.error(
            "❌ Error listing subscriptions in invoice.payment_succeeded:",
            err.message
          );
          console.error("Stack trace:", err.stack);
          break;
        }

        const stripeSubscriptionId = stripeSub.id;

        // Figure out which plan this subscription is using
        const priceId =
          stripeSub.items?.data?.[0]?.price?.id || line.price?.id || null;

        if (!priceId) {
          console.warn(
            "⚠ No priceId found in subscription or invoice line in invoice.payment_succeeded"
          );
          break;
        }

        console.log(
          "Looking up Plan by stripePriceId (invoice.payment_succeeded):",
          priceId
        );

        const plan = await planModel.findOne({ stripePriceId: priceId });
        if (!plan) {
          console.warn(
            "⚠ No Plan found for priceId in invoice.payment_succeeded:",
            priceId
          );
          break;
        }

        console.log("Plan found (invoice.payment_succeeded):", {
          id: plan._id,
          name: plan.name,
          stripePriceId: plan.stripePriceId,
        });

        // ✅ Reuse central helper: this will
        // - clear old isCurrent flags
        // - upsert this paid subscription with the correct period
        const saved =
          await SubscriptionService.upsertPaidSubscriptionFromStripe({
            firebaseUid,
            stripeCustomerId,
            stripeSubscriptionId,
            plan,
            periodStart,
            periodEnd,
          });

        console.log("Updated subscription document with correct period:", {
          id: saved && saved._id,
          firebaseUid: saved && saved.firebaseUid,
          plan: saved && saved.plan,
          currentPeriodStart: saved && saved.currentPeriodStart,
          currentPeriodEnd: saved && saved.currentPeriodEnd,
        });

        break;
      }
      case "invoice.payment_failed": {
        console.log("➡ Handling event: invoice.payment_failed");
        const invoice = event.data.object;
        console.log("Invoice ID:", invoice.id);
        console.log("Invoice subscription:", invoice.subscription);
        console.log("Invoice customer:", invoice.customer);
        console.log("Invoice status:", invoice.status);
        console.log(
          "Invoice attempt_count, paid, hosted_invoice_url:",
          invoice.attempt_count,
          invoice.paid,
          invoice.hosted_invoice_url
        );

        // Optional: you can mark subscription as past_due or send email
        // Example (minimal):
        /*
        const stripeSubscriptionId = invoice.subscription;

        if (stripeSubscriptionId) {
          console.log(
            "Would mark subscription as past_due in DB for stripeSubscriptionId:",
            stripeSubscriptionId
          );
          await subscriptionModel.updateMany(
            { stripeSubscriptionId },
            { status: "past_due" }
          );
          // Optionally send EmailService.sendPaymentFailedEmail(...)
        }
        */
        console.log("invoice.payment_failed received (no-op for now).");
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
    // still return 500 as before (functionality unchanged)
    res.status(500).send("Webhook handler error");
  }
};

module.exports = stripeWebhookHandler;
