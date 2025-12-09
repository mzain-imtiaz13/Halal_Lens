// src/scripts/subscription-expiry.script.js
require("dotenv").config();

const mongoose = require("mongoose"); // same instance used by connectDb
const { auth } = require("../config/firebaseAdmin.config");
const SubscriptionService = require("../services/subscription.service");
const EmailService = require("../services/email.service");
const subscriptionModel = require("../models/subscription.model");
const { connectDb } = require("../config/db.config");

// ---------- Firebase email lookup ----------
async function getUserEmailFromFirebase(firebaseUid) {
  try {
    const userRecord = await auth.getUser(firebaseUid);
    return userRecord.email || null;
  } catch (err) {
    console.error("⚠️ Failed to fetch Firebase user", firebaseUid, err.message);
    return null;
  }
}

// ---------- Core logic: process a single subscription ----------
async function processSingleSubscription(sub) {
  const now = new Date();

  if (!sub.currentPeriodEnd || sub.currentPeriodEnd > now) {
    return;
  }

  if (!sub.plan || !sub.plan.billingType) {
    await sub.populate("plan");
  }

  const plan = sub.plan;
  const firebaseUid = sub.firebaseUid;
  const email = await getUserEmailFromFirebase(firebaseUid);

  console.log(
    `➡️  Expiring subscription ${sub._id} [uid=${firebaseUid}, status=${sub.status}, plan=${plan?.code}]`
  );

  // Mark expired
  sub.isActive = false;
  sub.isCurrent = false;
  sub.endedAt = sub.currentPeriodEnd || now;
  await sub.save();

  // Trial flow → move to FREE + trial ended email (already handled in service)
  if (sub.status === "trial") {
    console.log(`   - Trial expired, moving to FREE for uid=${firebaseUid}`);
    await SubscriptionService.moveToFreePlan(firebaseUid, email);
    return;
  }

  // Paid recurring flow
  if (sub.status === "active" && plan && plan.billingType === "recurring") {
    if (email) {
      console.log(`   - Sending 'subscription expired' email to ${email}`);
      await EmailService.sendSubscriptionExpiredEmail(email, plan);
    } else {
      console.log("   - No email found, skipping email send");
    }

    // Optional: move them to free plan silently
    console.log(`   - Moving uid=${firebaseUid} to FREE plan (no email)`);
    await SubscriptionService.moveToFreePlan(firebaseUid, null);
  }
}

// ---------- Job runner ----------
async function runJobOnce() {
  const now = new Date();

  const candidates = await subscriptionModel
    .find({
      isActive: true,
      currentPeriodEnd: { $lte: now },
      status: { $in: ["trial", "active"] },
    })
    .populate("plan")
    .exec();

  console.log(
    `🔍 Found ${
      candidates.length
    } subscriptions to process at ${now.toISOString()}`
  );

  for (const sub of candidates) {
    try {
      await processSingleSubscription(sub);
    } catch (err) {
      console.error(
        `❌ Error processing subscription ${sub._id}:`,
        err.message
      );
    }
  }

  console.log("✅ Subscription expiry job completed");
}

// ---------- Entrypoint ----------
async function main() {
  try {
    // reuse central Mongo connection + plan seeding
    await connectDb();

    await runJobOnce();
  } catch (err) {
    console.error("❌ Job failed:", err);
  }
}

module.exports = main;
