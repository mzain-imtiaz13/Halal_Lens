const {
  STRIPE_PRICE_STANDARD_MONTHLY,
  STRIPE_PRICE_STANDARD_YEARLY,
} = require("../config/env.config");
const planModel = require("../models/plan.model");

const PlanService = {
  getAllActivePlans: async () => {
    return planModel.find({ isActive: true }).sort({ price: 1 });
  },

  decoratePlansForUi: (plans, subscription, isAuthenticated) => {
    const subStatus = subscription?.status;
    const isTrialActive = subStatus === "trial";
    const isFreeActive = subStatus === "free";
    const isPaidActive = subStatus === "active";

    const currentPlan =
      subscription && subscription.plan && subscription.plan.code
        ? subscription.plan
        : null;
    const currentPlanCode = currentPlan?.code || null;

    const hasPaidRecurring =
      isPaidActive &&
      (currentPlanCode === "STANDARD_MONTHLY" ||
        currentPlanCode === "STANDARD_YEARLY");

    return plans.map((p) => {
      const plan = p.toObject ? p.toObject() : p;

      let badgeType = "recurring";
      if (plan.billingType === "trial") badgeType = "trial";
      else if (plan.billingType === "free") badgeType = "free";
      else if (plan.billingType === "recurring") {
        badgeType = plan.interval === "month" ? "monthly" : "yearly";
      }

      // Default UI flags
      let showButton = false;
      let buttonLabel = "";
      let buttonVariant = "outline";
      let disabled = false;
      let action = null;

      // Anonymous user: only recurring plans get a "Sign in to subscribe" button
      if (!isAuthenticated) {
        if (plan.billingType === "recurring") {
          showButton = true;
          buttonLabel = "Sign in to subscribe";
          buttonVariant = "primary";
          disabled = false;
          action = "login";
        }
      } else {
        // Authenticated user
        if (plan.billingType === "recurring") {
          // Monthly / Yearly (user can manually subscribe)
          if (hasPaidRecurring) {
            // already on some recurring plan
            if (currentPlanCode === plan.code) {
              buttonLabel = "Subscribed";
              buttonVariant = "outline";
              disabled = true;
              action = null;
            } else {
              buttonLabel = "Already subscribed";
              buttonVariant = "outline";
              disabled = true;
              action = null;
            }
          } else if (isPaidActive && currentPlanCode === plan.code) {
            // edge case
            buttonLabel = "Subscribed";
            buttonVariant = "outline";
            disabled = true;
            action = null;
          } else {
            showButton = true;
            buttonLabel = "Subscribe";
            buttonVariant = "primary";
            disabled = false;
            action = "subscribe";
          }
        } else {
          // Trial & Free are system-managed: NO buttons at all
          showButton = false;

          // Optionally, you can reflect “active” states in the text only
          if (plan.billingType === "trial" && isTrialActive) {
            buttonLabel = "Trial Active";
          } else if (plan.billingType === "free" && isFreeActive) {
            buttonLabel = "Free Plan Active";
          }
        }
      }

      return {
        ...plan,
        ui: {
          badgeType,
          showButton,
          buttonLabel,
          buttonVariant,
          disabled,
          action,
        },
      };
    });
  },

  getPlanByCode: async (code) => {
    return planModel.findOne({ code, isActive: true });
  },

  seedDefaultPlans: async () => {
    const plans = [
      {
        name: "Standard Trial (7 days)",
        code: "TRIAL_7_DAYS",
        description: "7-day trial, 10 scans per day.",
        billingType: "trial",
        interval: null,
        price: 0,
        scansPerDay: 10,
        trialDays: 7,
      },
      {
        name: "Free Forever",
        code: "FREE_PLAN",
        description: "Free plan after trial. 2 scans per day.",
        billingType: "free",
        interval: null,
        price: 0,
        scansPerDay: 2,
      },
      {
        name: "Standard Monthly",
        code: "STANDARD_MONTHLY",
        description: "20 scans per day, billed monthly.",
        billingType: "recurring",
        interval: "month",
        price: 3,
        scansPerDay: 20,
        currency: "usd",
        stripePriceId: STRIPE_PRICE_STANDARD_MONTHLY,
      },
      {
        name: "Standard Yearly",
        code: "STANDARD_YEARLY",
        description: "20 scans per day, billed yearly.",
        billingType: "recurring",
        interval: "year",
        price: 30,
        scansPerDay: 20,
        currency: "usd",
        stripePriceId: STRIPE_PRICE_STANDARD_YEARLY,
      },
    ];

    for (const p of plans) {
      await planModel.findOneAndUpdate({ code: p.code }, p, {
        upsert: true,
        new: true,
      });
    }

    console.log("✅ Default plans seeded/updated");
  },
};

module.exports = PlanService;
