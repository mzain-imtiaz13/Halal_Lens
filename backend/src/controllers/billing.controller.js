const subscriptionModel = require("../models/subscription.model");
const EmailService = require("../services/email.service");
const PlanService = require("../services/plan.service");
const SubscriptionService = require("../services/subscription.service");

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const makeDateKey = (date) => {
  // YYYY-MM-DD in UTC
  return date.toISOString().slice(0, 10);
};

const getLastNDaysKeys = (n) => {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    out.push(makeDateKey(d));
  }
  return out;
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
      const firebaseUid = req.params.firebaseUid;

      if (!firebaseUid) {
        return res
          .status(400)
          .json({ message: "firebaseUid is required in URL" });
      }

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
  // GET /api/billing/revenue-reports
  // Monthly revenue + subscription counts from first paid month to current month
  getRevenueReports: async (req, res) => {
    try {
      // Load all subscriptions with their plan
      const subs = await subscriptionModel.find({}).populate("plan");

      // Filter to paid (recurring) subscriptions with a valid period start
      const paidSubs = subs.filter(
        (s) =>
          s.plan &&
          s.plan.billingType === "recurring" &&
          s.currentPeriodStart &&
          !isNaN(new Date(s.currentPeriodStart))
      );

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      let firstMonthStart = currentMonthStart;

      if (paidSubs.length > 0) {
        // Find earliest paid subscription month
        let minDate = new Date(paidSubs[0].currentPeriodStart);
        for (const s of paidSubs) {
          const d = new Date(s.currentPeriodStart);
          if (d < minDate) minDate = d;
        }
        firstMonthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      }

      // If for some reason firstMonthStart is after current, clamp
      if (firstMonthStart > currentMonthStart) {
        firstMonthStart = currentMonthStart;
      }

      // Build a map monthKey -> { totalRevenue, totalSubscriptions }
      const monthMap = new Map(); // key: "YYYY-MM"

      for (const s of paidSubs) {
        const d = new Date(s.currentPeriodStart);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const key = `${year}-${month}`;

        const price = Number(s.plan.price || 0);

        const entry = monthMap.get(key) || {
          totalRevenue: 0,
          totalSubscriptions: 0,
        };
        entry.totalRevenue += price;
        entry.totalSubscriptions += 1;
        monthMap.set(key, entry);
      }

      // Now walk from firstMonthStart -> currentMonthStart (inclusive)
      const reports = [];
      const generatedAt = new Date();
      const generatedOnStr = generatedAt
        .toISOString()
        .replace("T", " ")
        .slice(0, 19); // "YYYY-MM-DD HH:mm:ss"

      let cursor = new Date(firstMonthStart);
      while (cursor <= currentMonthStart) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, "0");
        const monthKey = `${y}-${m}`;

        const stats = monthMap.get(monthKey) || {
          totalRevenue: 0,
          totalSubscriptions: 0,
        };

        reports.push({
          month: monthKey,
          totalRevenue: stats.totalRevenue,
          totalSubscriptions: stats.totalSubscriptions,
          generatedOn: generatedOnStr,
        });

        // move to next month
        cursor.setMonth(cursor.getMonth() + 1);
      }

      // Sort descending by month (so latest on top, like your UI)
      reports.sort((a, b) => (a.month < b.month ? 1 : -1));

      return res.json({
        generatedAt: generatedAt.toISOString(),
        reports,
      });
    } catch (err) {
      console.error("Failed to compute revenue reports:", err);
      return res
        .status(500)
        .json({ message: "Failed to compute revenue reports" });
    }
  },


  // GET /api/billing/dashboard-subscriptions
  // Stats for admin dashboard (only paid/recurring subscriptions)
  getDashboardSubscriptionStats: async (req, res) => {
    try {
      // 1) Get all current & active subs, with plan populated
      const subscriptions = await subscriptionModel
        .find({
          isCurrent: true,
          isActive: true,
        })
        .populate("plan");

      // 2) Keep only paid / recurring plans (exclude free / trial)
      const paidSubs = subscriptions.filter(
        (sub) => sub.plan && sub.plan.billingType === "recurring"
      );

      // 3) Active paid subscriptions count
      const activeSubscriptions = paidSubs.length;

      // 4) Totals + trend
      let activeSubscriptionsAmount = 0;
      let revenueMTD = 0;

      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const dayKeys = getLastNDaysKeys(12); // oldest -> newest
      const dayIndex = Object.fromEntries(dayKeys.map((k, i) => [k, i]));
      const revenueTrendLast12Days = new Array(dayKeys.length).fill(0);

      for (const sub of paidSubs) {
        const plan = sub.plan;
        if (!plan) continue;

        const price = Number(plan.price || 0);

        // total active paid subscription amount (MRR-ish)
        activeSubscriptionsAmount += price;

        const periodStart = sub.currentPeriodStart;
        if (!periodStart || isNaN(new Date(periodStart))) continue;

        const ps = new Date(periodStart);

        // --- Revenue MTD (this month) ---
        if (ps >= monthStart && ps <= today) {
          revenueMTD += price;
        }

        // --- Revenue trend (last 12 days) ---
        const key = makeDateKey(ps);
        if (dayIndex[key] != null) {
          revenueTrendLast12Days[dayIndex[key]] += price;
        }
      }

      return res.json({
        activeSubscriptions,
        activeSubscriptionsAmount,
        revenueMTD,
        revenueTrendLast12Days,
      });
    } catch (err) {
      console.error("Failed to compute dashboard subscription stats:", err);
      return res.status(500).json({
        message: "Failed to compute subscription metrics for dashboard",
      });
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
