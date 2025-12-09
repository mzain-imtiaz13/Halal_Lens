const Stripe = require("stripe");
const planModel = require("../models/plan.model");
const subscriptionModel = require("../models/subscription.model");
const EmailService = require("./email.service");
const UserService = require("./user.service");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Helper: mark all user subscriptions as not current (used before creating a new one)
const clearCurrentFlagForUser = async (firebaseUid) => {
  await subscriptionModel.updateMany(
    { firebaseUid, isCurrent: true },
    { isCurrent: false }
  );
};

// Helper: handle expiry for a subscription document
const handleSubscriptionExpiryIfNeeded = async (subDoc) => {
  if (!subDoc) return { expired: false, updated: subDoc };

  const now = new Date();
  const plan = subDoc.plan; // might be populated or not

  // If no currentPeriodEnd, we can't time-based expire it (e.g. free plan)
  if (!subDoc.currentPeriodEnd) {
    return { expired: false, updated: subDoc };
  }

  const hasEnded = subDoc.currentPeriodEnd <= now;
  if (!hasEnded) {
    return { expired: false, updated: subDoc };
  }

  // It has passed currentPeriodEnd ⇒ treat as expired for trial or paid
  let shouldExpire = false;

  if (subDoc.status === "trial") {
    shouldExpire = true;
  } else if (
    subDoc.status === "active" &&
    plan &&
    plan.billingType === "recurring"
  ) {
    // Paid recurring - if no Stripe webhook changed status, we treat it as ended here
    shouldExpire = true;
  }

  if (!shouldExpire) {
    return { expired: false, updated: subDoc };
  }

  subDoc.isActive = false;
  subDoc.isCurrent = false;
  subDoc.endedAt = subDoc.currentPeriodEnd || now;
  await subDoc.save();

  return { expired: true, updated: subDoc };
};

// Helper: create or return a "free" subscription and mark it as current
const createOrGetFreeSubscription = async (firebaseUid, email) => {
  const freePlan = await planModel.findOne({
    code: "FREE_PLAN",
    isActive: true,
  });
  if (!freePlan) throw new Error("Free plan not configured");

  // Check if there's already a free subscription that is active
  let existingFree = await subscriptionModel
    .findOne({
      firebaseUid,
      status: "free",
      isActive: true,
    })
    .sort({ createdAt: -1 })
    .populate("plan");

  if (existingFree) {
    // Make sure this is marked as current
    await clearCurrentFlagForUser(firebaseUid);
    existingFree.isCurrent = true;
    await existingFree.save();
    return existingFree;
  }

  // Otherwise create a new one
  await clearCurrentFlagForUser(firebaseUid);

  const sub = await subscriptionModel.create({
    firebaseUid,
    plan: freePlan._id,
    status: "free",
    isActive: true,
    isCurrent: true,
  });

  const populated = await sub.populate("plan");

  // Optional: if you only want to send "moved to free" emails in some flows,
  // keep this guarded behind email param:
  if (email) {
    await EmailService.sendTrialEndedNowOnFreeEmail(email, freePlan);
  }

  return populated;
};

const SubscriptionService = {
  // 🔹 This is now "smart": ensures we always return a valid current sub
  // Falls back to FREE plan if:
  //  - no subscription exists, OR
  //  - current subscription is expired
  getCurrentSubscriptionForUser: async (firebaseUid) => {
    const user = await UserService.getUserById(firebaseUid);
    const email = user.email;
    if (user.role === "admin") {
      const adminPlan = await planModel.findOne({
          code: "INFINITE_ADMIN_PLAN",
        });
      let current = await subscriptionModel
        .findOne({ firebaseUid, isCurrent: true, plan: adminPlan._id })
        .populate("plan");
      
      // If no subscription, create an "infinite" admin subscription
      if (!current) {
        await subscriptionModel.deleteMany({ firebaseUid })  
        current = await subscriptionModel.create({
          firebaseUid,
          plan: adminPlan._id,
          status: "active",
          isActive: true,
          isCurrent: true,
        });
      }

      return current.populate('plan');
    }
    // Try to get a subscription marked as current
    let current = await subscriptionModel
      .findOne({ firebaseUid, isCurrent: true })
      .populate("plan");

    // If no isCurrent, fall back to most recent one (for older data)
    if (!current) {
      current = await subscriptionModel
        .findOne({ firebaseUid })
        .sort({ createdAt: -1 })
        .populate("plan");
    }

    // If still nothing => directly move/create FREE plan subscription
    if (!current) {
      return await createOrGetFreeSubscription(firebaseUid, email);
    }

    // If it's a free subscription that is active, just return it
    if (
      current.status === "free" &&
      current.isActive &&
      current.plan &&
      current.plan.billingType === "free"
    ) {
      // Ensure it's marked as current
      if (!current.isCurrent) {
        await clearCurrentFlagForUser(firebaseUid);
        current.isCurrent = true;
        await current.save();
      }
      return current;
    }

    // Handle expiry for trial or paid recurring
    const { expired } = await handleSubscriptionExpiryIfNeeded(current);

    if (expired) {
      // Fallback to free if expired
      return await createOrGetFreeSubscription(firebaseUid, email);
    }

    // If not expired but accidentally isCurrent:false, fix it
    if (!current.isCurrent) {
      await clearCurrentFlagForUser(firebaseUid);
      current.isCurrent = true;
      await current.save();
    }

    return current;
  },

  // Return ALL subscriptions (history) for dashboard
  getAllSubscriptionsForUser: async (firebaseUid) => {
    return subscriptionModel
      .find({ firebaseUid })
      .populate("plan")
      .sort({ createdAt: -1 });
  },

  // Called on signup from app: starts trial & sends trial activation email
  startTrialIfNotExists: async (firebaseUid, email) => {
    // If already have any active trial, just return it
    let existing = await subscriptionModel
      .findOne({
        firebaseUid,
        status: "trial",
        isActive: true,
      })
      .populate("plan")
      .sort({ createdAt: -1 });

    if (existing) {
      // Ensure it's current
      await clearCurrentFlagForUser(firebaseUid);
      existing.isCurrent = true;
      await existing.save();
      return existing;
    }

    const plan = await planModel.findOne({
      code: "TRIAL_7_DAYS",
      isActive: true,
    });
    if (!plan) throw new Error("Trial plan not configured");

    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + (plan.trialDays || 7));

    // Mark other subs as not current
    await clearCurrentFlagForUser(firebaseUid);

    const sub = await subscriptionModel.create({
      firebaseUid,
      plan: plan._id,
      status: "trial",
      currentPeriodStart: now,
      currentPeriodEnd: end,
      isCurrent: true,
      isActive: true,
    });

    const populated = await sub.populate("plan");

    if (email) {
      await EmailService.sendTrialActivationEmail(email, plan, end);
    }

    return populated;
  },

  // To be used when trial expires (via cron/worker) to move user to free plan
  moveToFreePlan: async (firebaseUid, email) => {
    const freeSub = await createOrGetFreeSubscription(firebaseUid, email);
    return freeSub;
  },

  // Create Stripe checkout session for Standard plans (now one-time payment)
  createCheckoutSessionForPlan: async ({
    firebaseUid,
    customerEmail,
    planCode,
    successUrl,
    cancelUrl,
  }) => {
    const plan = await planModel.findOne({ code: planCode, isActive: true });
    if (!plan) throw new Error("planModel not found");

    // We keep this check to avoid breaking existing semantics:
    // "recurring" here just means "Stripe-paid plan" in your system, not Stripe subscriptions.
    if (plan.billingType !== "recurring") {
      throw new Error("This plan does not require Stripe checkout");
    }
    if (!plan.stripePriceId) {
      throw new Error("stripePriceId not configured for this plan");
    }

    // Create / attach Stripe customer with firebaseUid in metadata
    const customer = await stripe.customers.create({
      email: customerEmail || undefined,
      metadata: { firebaseUid },
    });

    // One-time payment Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // ✅ one-time
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price: plan.stripePriceId, // one-time price in Stripe
          quantity: 1,
        },
      ],
      // We attach metadata so webhook can resolve plan without extra queries
      metadata: {
        firebaseUid,
        planCode,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url };
  },

  // Helper for Stripe webhook when a paid subscription becomes active
  // (call this in your webhook after retrieving stripeSub + matching plan)
  upsertPaidSubscriptionFromStripe: async ({
    firebaseUid,
    stripeCustomerId,
    stripeSubscriptionId,
    plan,
  }) => {
    // Mark all old subs as not current
    await clearCurrentFlagForUser(firebaseUid);

    const updateDoc = {
      firebaseUid,
      plan: plan._id,
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId,
      isActive: true,
      isCurrent: true,
    };
    const now = new Date();
    const end = new Date();

    // Mongo-based period logic (no Stripe billing periods)
    if (plan.interval === "month" || plan.interval === "monthly") {
      end.setMonth(now.getMonth() + 1);
    } else if (plan.interval === "year" || plan.interval === "yearly") {
      end.setFullYear(now.getFullYear() + 1);
    } else if (plan.interval === "week" || plan.interval === "weekly") {
      end.setDate(now.getDate() + 7);
    }
    // you can add more intervals if needed; otherwise it becomes "no expiry"

    updateDoc.currentPeriodStart = now;
    updateDoc.currentPeriodEnd = end;

    const saved = await subscriptionModel
      .findOneAndUpdate({ firebaseUid, stripeSubscriptionId }, updateDoc, {
        upsert: true,
        new: true,
      })
      .populate("plan");

    return saved;
  },
  // Set current period dates for the user's current subscription
  setCurrentPeriodForUser: async ({ firebaseUid, periodStart, periodEnd }) => {
    const update = {};

    if (periodStart) update.currentPeriodStart = periodStart;
    if (periodEnd) update.currentPeriodEnd = periodEnd;

    const saved = await subscriptionModel
      .findOneAndUpdate(
        { firebaseUid, isCurrent: true }, // update the current sub for this user
        update,
        { new: true }
      )
      .populate("plan");

    return saved;
  },
};

module.exports = SubscriptionService;
