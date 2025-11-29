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

      // Default: anonymous user – show only "Sign in to select"
      if (!isAuthenticated) {
        return {
          ...plan,
          ui: {
            badgeType,
            showButton: true,
            buttonLabel: "Sign in to select",
            buttonVariant: "primary",
            disabled: false,
            action: "login",
          },
        };
      }

      // Authenticated user – decide per plan
      let showButton = true;
      let buttonLabel = "Select";
      let buttonVariant = "outline"; // 'primary' | 'outline'
      let disabled = false;
      let action = null;

      if (plan.billingType === "trial") {
        if (isTrialActive) {
          buttonLabel = "Trial Active";
          buttonVariant = "outline";
          disabled = true;
          action = null;
        } else if (hasPaidRecurring) {
          // user already on monthly/yearly
          buttonLabel = "Already subscribed";
          buttonVariant = "outline";
          disabled = true;
          action = null;
        } else {
          buttonLabel = `Start ${plan.trialDays || 7}-Day Trial`;
          buttonVariant = "primary";
          disabled = false;
          action = "start_trial";
        }
      } else if (plan.billingType === "free") {
        // Free plan behavior
        if (hasPaidRecurring) {
          // if subscribed to monthly or yearly then free will be disabled because Already subscribed
          showButton = true;
          buttonLabel = "Already subscribed";
          buttonVariant = "outline";
          disabled = true;
          action = null;
        } else if (isFreeActive) {
          showButton = true;
          buttonLabel = "Free Plan Active";
          buttonVariant = "outline";
          disabled = true;
          action = null;
        } else {
          // e.g. trial-only or no sub yet – we can hide button or enable "Switch to Free" in future
          showButton = false;
          action = null;
        }
      } else if (plan.billingType === "recurring") {
        // Monthly / Yearly
        if (hasPaidRecurring) {
          // already on some recurring plan
          if (currentPlanCode === plan.code) {
            buttonLabel = "Subscribed";
            buttonVariant = "outline";
            disabled = true;
            action = null;
          } else {
            // other recurring plan should also be disabled
            buttonLabel = "Already subscribed";
            buttonVariant = "outline";
            disabled = true;
            action = null;
          }
        } else if (isPaidActive && currentPlanCode === plan.code) {
          // active paid but somehow not in hasPaidRecurring (edge case)
          buttonLabel = "Subscribed";
          buttonVariant = "outline";
          disabled = true;
          action = null;
        } else {
          buttonLabel = "Subscribe";
          buttonVariant = "primary";
          disabled = false;
          action = "subscribe";
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
        description: "10 scans per day, billed monthly.",
        billingType: "recurring",
        interval: "month",
        price: 3,
        scansPerDay: 10,
        currency: "usd",
        stripePriceId: STRIPE_PRICE_STANDARD_MONTHLY,
      },
      {
        name: "Standard Yearly",
        code: "STANDARD_YEARLY",
        description: "10 scans per day, billed yearly.",
        billingType: "recurring",
        interval: "year",
        price: 30,
        scansPerDay: 10,
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
