const Stripe = require("stripe");
const planModel = require("../models/plan.model");
const subscriptionModel = require("../models/subscription.model");
const EmailService = require("./email.service");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const SubscriptionService = {
  getCurrentSubscriptionForUser: async (firebaseUid) => {
    return subscriptionModel
      .findOne({ firebaseUid })
      .populate("plan")
      .sort({ createdAt: -1 });
  },

  // Called on signup from app: starts trial & sends trial activation email
  startTrialIfNotExists: async (firebaseUid, email) => {
    const existing = await subscriptionModel.findOne({
      firebaseUid,
      status: "trial",
    });
    if (existing) return existing;

    const plan = await planModel.findOne({
      code: "TRIAL_7_DAYS",
      isActive: true,
    });
    if (!plan) throw new Error("Trial plan not configured");

    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + (plan.trialDays || 7));

    const sub = await subscriptionModel.create({
      firebaseUid,
      plan: plan._id,
      status: "trial",
      currentPeriodStart: now,
      currentPeriodEnd: end,
    });

    const populated = await sub.populate("plan");

    if (email) {
      await EmailService.sendTrialActivationEmail(email, plan, end);
    }

    return populated;
  },

  // To be used when trial expires (via cron/worker) to move user to free plan
  moveToFreePlan: async (firebaseUid, email) => {
    const plan = await planModel.findOne({
      code: "FREE_PLAN",
      isActive: true,
    });
    if (!plan) throw new Error("Free plan not configured");

    const sub = await subscriptionModel.create({
      firebaseUid,
      plan: plan._id,
      status: "free",
    });

    const populated = await sub.populate("plan");

    if (email) {
      await EmailService.sendTrialEndedNowOnFreeEmail(email, plan);
    }

    return populated;
  },

  createCheckoutSessionForPlan: async ({
    firebaseUid,
    customerEmail,
    planCode,
    successUrl,
    cancelUrl,
  }) => {
    const plan = await planModel.findOne({ code: planCode, isActive: true });
    if (!plan) throw new Error("planModel not found");
    if (plan.billingType !== "recurring") {
      throw new Error("This plan does not require Stripe checkout");
    }
    if (!plan.stripePriceId) {
      throw new Error("stripePriceId not configured for this plan");
    }

    const customer = await stripe.customers.create({
      email: customerEmail || undefined,
      metadata: { firebaseUid },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url };
  },
};

module.exports = SubscriptionService;
