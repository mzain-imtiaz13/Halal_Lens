const express = require("express");
const router = express.Router();

const firebaseAuth = require("../middlewares/auth.middleware");
const BillingController = require("../controllers/billing.controller");
const maybeFirebaseAuth = require("../middlewares/maybeFirebaseAuth.middleware");

// public: list plans
router.get("/plans", BillingController.getPlans);
router.get("/overview", maybeFirebaseAuth, BillingController.getOverview);
router.get("/me", firebaseAuth, BillingController.getMySubscription);
router.post("/start-trial", firebaseAuth, BillingController.startTrial);
router.post("/checkout", firebaseAuth, BillingController.createCheckoutSession);

module.exports = router;
