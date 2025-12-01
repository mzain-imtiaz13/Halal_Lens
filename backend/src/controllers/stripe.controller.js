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
  // Debug logs (keep or remove as you like)
  console.log("STRIPE_WEBHOOK_SECRET prefix:", (STRIPE_WEBHOOK_SECRET || "").slice(0, 10));

  const sig = req.headers["stripe-signature"];
  console.log("Stripe signature header:", sig);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,            // raw body (make sure express.raw is used for this route)
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const customer = await stripe.customers.retrieve(session.customer);
        const firebaseUid = customer.metadata?.firebaseUid;
        const stripeSubscriptionId = session.subscription;

        if (!firebaseUid || !stripeSubscriptionId) {
          console.warn("Missing firebaseUid or stripeSubscriptionId in session");
          break;
        }

        // Get full Stripe subscription
        const stripeSub = await stripe.subscriptions.retrieve(
          stripeSubscriptionId
        );

        const priceId = stripeSub.items?.data?.[0]?.price?.id;
        if (!priceId) {
          console.warn("No priceId found on subscription items");
          break;
        }

        const plan = await planModel.findOne({ stripePriceId: priceId });
        if (!plan) {
          console.warn(
            "No Plan found for priceId:",
            priceId,
            "– make sure stripePriceId is set on Plan."
          );
          break;
        }

        const periodStart = unixToDate(stripeSub.current_period_start);
        const periodEnd = unixToDate(stripeSub.current_period_end);

        // ✅ Use new helper to ensure:
        // - this paid sub is isCurrent=true, isActive=true
        // - all previous subs have isCurrent=false
        const saved = await SubscriptionService.upsertPaidSubscriptionFromStripe({
          firebaseUid,
          stripeCustomerId: customer.id,
          stripeSubscriptionId,
          plan,
          periodStart,
          periodEnd,
        });

        // Send purchase confirmation email
        if (customer.email) {
          await EmailService.sendPlanPurchaseConfirmationEmail(
            customer.email,
            plan,
            periodEnd
          );
        }

        console.log("✅ checkout.session.completed handled, subscription:", saved._id);
        break;
      }

      case "invoice.payment_failed": {
        // Optional: you can mark subscription as past_due or send email
        // Example (minimal):
        /*
        const invoice = event.data.object;
        const stripeSubscriptionId = invoice.subscription;

        if (stripeSubscriptionId) {
          await subscriptionModel.updateMany(
            { stripeSubscriptionId },
            { status: "past_due" }
          );
          //Optionally send EmailService.sendPaymentFailedEmail(...)
        }
        */
        console.log("invoice.payment_failed received (no-op for now).");
        break;
      }

      // You can optionally handle cancellations:
      // case "customer.subscription.deleted":
      // case "customer.subscription.updated":
      // e.g. mark isActive=false, isCurrent=false, and optionally move to free plan
      //   break;

      default:
        // console.log(`Unhandled event type ${event.type}`);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    res.status(500).send("Webhook handler error");
  }
};

module.exports = stripeWebhookHandler;
