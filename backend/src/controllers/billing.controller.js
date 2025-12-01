const EmailService = require("../services/email.service");
const PlanService = require("../services/plan.service");
const SubscriptionService = require("../services/subscription.service");

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

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

  // GET /api/billing/overview (used by web UI)
  getOverview: async (req, res) => {
    try {
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

  getSubscriptionHistory: async (req, res) => {
    try {
      const firebaseUid = req.user.uid;

      const history = await SubscriptionService.getAllSubscriptionsForUser(
        firebaseUid
      );

      const formatted = history.map((h) => ({
        id: h._id,
        planName: h.plan?.name || "Unknown",
        planCode: h.plan?.code || null,
        status: h.status,
        startDate: h.currentPeriodStart || h.createdAt,
        endDate: h.currentPeriodEnd || h.endedAt || null,
        isActive: h.isActive,
        isCurrent: h.isCurrent,
        createdAt: h.createdAt,
      }));

      res.json({ history: formatted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch subscription history" });
    }
  },

  // POST /api/billing/start-trial
  // Called from app on signup – NOT from web UI
  startTrial: async (req, res) => {
    try {
      const { uid, email } = req.user; // from firebaseAuth middleware
      const sub = await SubscriptionService.startTrialIfNotExists(uid, email);
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
      const { uid, email } = req.user;
      const { planCode } = req.body;

      const base = process.env.FRONTEND_URL?.replace(/\/+$/, "") || "";
      const successUrl = `${base}/billing/success`;
      const cancelUrl = `${base}/billing/cancel`;

      const session = await SubscriptionService.createCheckoutSessionForPlan({
        firebaseUid: uid,
        customerEmail: email,
        planCode,
        successUrl,
        cancelUrl,
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error(err);
      res.status(400).json({
        message: err.message || "Failed to create checkout session",
      });
    }
  },
  sendAllTestEmails: async (req, res) => {
    // hard-coded test email as you requested
    const to = "faaiz290302@gmail.com";

    // Fake plans & dates for preview
    const trialPlan = {
      name: "Standard Trial (7 days)",
      scansPerDay: 10,
    };

    const freePlan = {
      name: "Free Forever",
      scansPerDay: 2,
    };

    const paidPlan = {
      name: "Standard Monthly",
      scansPerDay: 10,
    };

    const trialEnd = addDays(7);
    const periodEnd = addDays(30);

    try {
      const results = await Promise.allSettled([
        // 1) Trial activation
        EmailService.sendTrialActivationEmail(to, trialPlan, trialEnd),

        // 3) Trial ended → moved to free
        EmailService.sendTrialEndedNowOnFreeEmail(to, freePlan),

        // 4) Plan purchase confirmation
        EmailService.sendPlanPurchaseConfirmationEmail(to, paidPlan, periodEnd),

        // 6) Subscription expired
        EmailService.sendSubscriptionExpiredEmail(to, paidPlan),
      ]);

      // Build a small summary for debugging
      const summary = results.map((r, idx) => ({
        index: idx,
        status: r.status,
        reason:
          r.status === "rejected"
            ? r.reason?.message || String(r.reason)
            : null,
      }));

      return res.json({
        success: true,
        to,
        message: "Test emails triggered. Check your inbox.",
        results: summary,
      });
    } catch (err) {
      console.error("❌ Error sending test emails:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send test emails" });
    }
  },
};

module.exports = BillingController;
