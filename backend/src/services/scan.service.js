// services/scan.service.js
const SubscriptionService = require("./subscription.service");
const PlanService = require("./plan.service");
const scanUsageModel = require("../models/scanUsage.model");

const ScanService = {
  // Always use UTC dateKey so logic is consistent
  getTodayDateKey: () => {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" in UTC
  },

  // Determine which plan + limit is currently effective for user
  getEffectivePlanForUser: async (firebaseUid) => {
    const subscription = await SubscriptionService.getCurrentSubscriptionForUser(
      firebaseUid
    );

    let plan = null;
    let source = "fallback_free";
    let status = subscription?.status || "none";

    if (subscription && subscription.plan) {
      plan = subscription.plan;
      source = "subscription";
    } else {
      // If no subscription record, treat user as FREE plan
      plan = await PlanService.getPlanByCode("FREE_PLAN");
      status = "free";
    }

    const scansPerDay = plan?.scansPerDay ?? 2;
    const planCode = plan?.code || "FREE_PLAN";
    const planName = plan?.name || "Free Plan";

    return {
      plan,
      planCode,
      planName,
      scansPerDay,
      subscriptionStatus: status,
      source,
    };
  },

  // Check if user can still scan today (no mutation)
  checkScanAllowed: async (firebaseUid) => {
    const dateKey = ScanService.getTodayDateKey();
    const effective = await ScanService.getEffectivePlanForUser(firebaseUid);

    const { scansPerDay, planCode, planName, subscriptionStatus } = effective;
    const usage =
      (await scanUsageModel.findOne({ firebaseUid, dateKey })) || {
        used: 0,
      };

    const used = usage.used || 0;
    const remaining = Math.max(scansPerDay - used, 0);
    const allowed = remaining > 0;

    return {
      allowed,
      remaining,
      used,
      limit: scansPerDay,
      dateKey,
      planCode,
      planName,
      subscriptionStatus,
      // Recommended message for app popups
      message: allowed
        ? "Scan allowed."
        : "You’ve completed today’s available scans. Please try again tomorrow.",
    };
  },

  // Consume one scan (if possible) and return updated status
  consumeScan: async (firebaseUid) => {
    const dateKey = ScanService.getTodayDateKey();
    const effective = await ScanService.getEffectivePlanForUser(firebaseUid);
    const { scansPerDay, planCode, planName, subscriptionStatus } = effective;

    // Get current usage
    let usage = await scanUsageModel.findOne({ firebaseUid, dateKey });

    if (!usage) {
      // First scan of the day
      if (scansPerDay <= 0) {
        return {
          allowed: false,
          remaining: 0,
          used: 0,
          limit: scansPerDay,
          dateKey,
          planCode,
          planName,
          subscriptionStatus,
          message:
            "You’ve completed today’s available scans. Please try again tomorrow.",
        };
      }

      usage = await scanUsageModel.create({
        firebaseUid,
        dateKey,
        used: 1,
        planCode,
      });

      return {
        allowed: true,
        remaining: scansPerDay - 1,
        used: 1,
        limit: scansPerDay,
        dateKey,
        planCode,
        planName,
        subscriptionStatus,
        message: "Scan allowed.",
      };
    }

    // If already at or above limit
    if (usage.used >= scansPerDay) {
      return {
        allowed: false,
        remaining: 0,
        used: usage.used,
        limit: scansPerDay,
        dateKey,
        planCode,
        planName,
        subscriptionStatus,
        message:
          "You’ve completed today’s available scans. Please try again tomorrow.",
      };
    }

    // Increment usage
    usage.used += 1;
    await usage.save();

    const remaining = Math.max(scansPerDay - usage.used, 0);

    return {
      allowed: true,
      remaining,
      used: usage.used,
      limit: scansPerDay,
      dateKey,
      planCode,
      planName,
      subscriptionStatus,
      message: "Scan allowed.",
    };
  },
};

module.exports = ScanService;
