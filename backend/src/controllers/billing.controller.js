const { default: mongoose } = require("mongoose");
const { mongoConfig } = require("../config");
const PlanService = require("../services/plan.service");
const SubscriptionService = require("../services/subscription.service");

const BillingController = {
  // GET /api/billing/plans
  getPlans: async (req, res) => {
    try {
      const plans = await PlanService.getAllActivePlans();
      res.json(plans);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  },
  getOverview: async (req, res) => {
    try {
      console.log("----- BILLING /plans HIT -----");
      console.log("Mongo URL from controller:", mongoConfig.url);
      console.log("Mongoose readyState:", mongoose.connection.readyState);
      const firebaseUid = req.user?.uid || null;

      const plans = await PlanService.getAllActivePlans();
      let subscription = null;

      if (firebaseUid) {
        subscription = await SubscriptionService.getCurrentSubscriptionForUser(
          firebaseUid
        );
      }
      const decoratedPlans = PlanService.decoratePlansForUi(
        plans,
        subscription,
        !!firebaseUid
      );

      res.json({
        isAuthenticated: !!firebaseUid,
        subscription,
        plans: decoratedPlans,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch billing overview" });
    }
  },

  // POST /api/billing/start-trial
  startTrial: async (req, res) => {
    try {
      const firebaseUid = req.user.uid; // from firebaseAuth middleware
      const sub = await SubscriptionService.startTrialIfNotExists(firebaseUid);
      res.json(sub);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to start trial" });
    }
  },

  // GET /api/billing/me
  getMySubscription: async (req, res) => {
    try {
      const firebaseUid = req.user.uid;
      const sub = await SubscriptionService.getCurrentSubscriptionForUser(
        firebaseUid
      );
      res.json(sub);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  },

  // POST /api/billing/checkout
  // body: { planCode }
  createCheckoutSession: async (req, res) => {
    try {
      const firebaseUid = req.user.uid;
      const { planCode } = req.body;

      const successUrl = `${process.env.FRONTEND_URL}billing/success`;
      const cancelUrl = `${process.env.FRONTEND_URL}billing/cancel`;

      const session = await SubscriptionService.createCheckoutSessionForPlan({
        firebaseUid,
        planCode,
        successUrl,
        cancelUrl,
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error(err);
      res
        .status(400)
        .json({ message: err.message || "Failed to create checkout session" });
    }
  },
};

module.exports = BillingController;
