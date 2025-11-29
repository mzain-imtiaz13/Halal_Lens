const Stripe = require("stripe");
const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = require("../config/env.config");
const planModel = require("../models/plan.model");
const subscriptionModel = require("../models/subscription.model");

const stripe = Stripe(STRIPE_SECRET_KEY);

// small helper
const unixToDate = (value) => {
  if (typeof value !== "number") return null;
  const d = new Date(value * 1000);
  return isNaN(d.valueOf()) ? null : d;
};

const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
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

        const stripeSub = await stripe.subscriptions.retrieve(
          stripeSubscriptionId
        );

        // Log once if needed
        // console.log("Stripe subscription object:", stripeSub);

        const priceId = stripeSub.items?.data?.[0]?.price?.id;
        if (!priceId) {
          console.warn("No priceId found on subscription items");
          break;
        }

        const plan = await planModel.findOne({ stripePriceId: priceId });

        if (!plan) {
          console.warn(
            "No Plan found for priceId: ",
            priceId,
            " – make sure stripePriceId is set on Plan."
          );
          break;
        }

        const periodStart = unixToDate(stripeSub.current_period_start);
        const periodEnd = unixToDate(stripeSub.current_period_end);

        const updateDoc = {
          firebaseUid,
          plan: plan._id,
          status: "active",
          stripeCustomerId: customer.id,
          stripeSubscriptionId,
        };

        if (periodStart) updateDoc.currentPeriodStart = periodStart;
        if (periodEnd) updateDoc.currentPeriodEnd = periodEnd;

        await subscriptionModel.findOneAndUpdate(
          { firebaseUid, stripeSubscriptionId },
          updateDoc,
          { upsert: true, new: true }
        );

        break;
      }

      case "invoice.payment_failed": {
        // Optional: mark subscription as past_due etc.
        break;
      }

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
