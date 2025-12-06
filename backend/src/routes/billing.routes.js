const express = require("express");
const router = express.Router();

const firebaseAuth = require("../middlewares/auth.middleware");
const BillingController = require("../controllers/billing.controller");
const maybeFirebaseAuth = require("../middlewares/maybeFirebaseAuth.middleware");

// public: list plans
router.get("/plans", BillingController.getPlans);
router.get("/overview", maybeFirebaseAuth, BillingController.getOverview);
router.get("/history/:firebaseUid", BillingController.getSubscriptionHistory);
router.get(
  "/revenue-reports",
  BillingController.getRevenueReports
);
router.get(
  "/dashboard-subscriptions",
  firebaseAuth,
  BillingController.getDashboardSubscriptionStats
);
// protected
router.get("/me", firebaseAuth, BillingController.getMySubscription);

// used by APP signup (auto trial activation)
router.post("/start-trial", firebaseAuth, BillingController.startTrial);

// used by web/app to purchase monthly/yearly
router.post("/checkout", firebaseAuth, BillingController.createCheckoutSession);

router.get("/emails", BillingController.sendAllTestEmails);
module.exports = router;
