// src/scripts/subscription-expiry.script.js
require("dotenv").config();

const { auth } = require("../config/firebaseAdmin.config");
const SubscriptionService = require("../services/subscription.service");
const EmailService = require("../services/email.service");
const subscriptionModel = require("../models/subscription.model");
const { connectDb } = require("../config/db.config");

/* -------------------- Small logging helpers -------------------- */
const RUN_ID = `${new Date().toISOString()}_${Math.random()
  .toString(16)
  .slice(2, 8)}`;

function ms(n) {
  return `${Math.round(n)}ms`;
}

function nowIso() {
  return new Date().toISOString();
}

function safeJson(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

function log(ctx, msg, extra) {
  const base = `[run=${RUN_ID} sub=${ctx?.subId || "-"} uid=${
    ctx?.uid || "-"
  } idx=${ctx?.idx ?? "-"}]`;
  if (extra !== undefined) {
    console.log(
      `${nowIso()} ${base} ${msg} :: ${
        typeof extra === "string" ? extra : safeJson(extra)
      }`
    );
  } else {
    console.log(`${nowIso()} ${base} ${msg}`);
  }
}

function logErr(ctx, msg, err) {
  const details = {
    message: err?.message,
    name: err?.name,
    code: err?.code,
    errno: err?.errno,
    syscall: err?.syscall,
    address: err?.address,
    port: err?.port,
    type: err?.type,
    stack: err?.stack,
    // helpful for axios-like errors (just in case)
    responseStatus: err?.response?.status,
    responseData: err?.response?.data,
  };
  console.error(
    `${nowIso()} [run=${RUN_ID} sub=${ctx?.subId || "-"} uid=${
      ctx?.uid || "-"
    } idx=${ctx?.idx ?? "-"}] ❌ ${msg}`
  );
  console.error(`${nowIso()} [run=${RUN_ID}] ❌ error_details:`, details);
}

/* -------------------- Step timer wrapper -------------------- */
async function step(ctx, label, fn) {
  const t0 = Date.now();
  log(ctx, `▶️ START ${label}`);
  try {
    const res = await fn();
    log(ctx, `✅ END   ${label} (${ms(Date.now() - t0)})`);
    return res;
  } catch (err) {
    logErr(ctx, `FAILED ${label} (${ms(Date.now() - t0)})`, err);
    throw err;
  }
}

/* -------------------- Firebase email lookup -------------------- */
async function getUserEmailFromFirebase(firebaseUid, ctx) {
  return await step(ctx, "firebase:getUserEmail", async () => {
    const userRecord = await auth.getUser(firebaseUid);
    return userRecord?.email || null;
  }).catch((err) => {
    // IMPORTANT: we swallow firebase lookup errors to allow job to proceed
    console.error(
      `${nowIso()} [run=${RUN_ID} uid=${firebaseUid}] ⚠️ Firebase lookup failed: ${
        err?.message
      }`
    );
    return null;
  });
}

/* -------------------- Core logic: process a single subscription -------------------- */
async function processSingleSubscription(sub, idx, opts) {
  const ctx = {
    subId: String(sub?._id),
    uid: String(sub?.firebaseUid || "-"),
    idx,
  };

  const now = new Date();
  const dryRun = !!opts?.dryRun;

  // Extra context at the top (super helpful when debugging)
  log(ctx, "📌 subscription_snapshot", {
    status: sub.status,
    isActive: sub.isActive,
    isCurrent: sub.isCurrent,
    currentPeriodEnd: sub.currentPeriodEnd,
    currentPeriodStart: sub.currentPeriodStart,
    endedAt: sub.endedAt,
    plan:
      sub.plan && typeof sub.plan === "object"
        ? { code: sub.plan.code, billingType: sub.plan.billingType }
        : sub.plan,
  });

  // Guard: not expired
  if (!sub.currentPeriodEnd || sub.currentPeriodEnd > now) {
    log(ctx, "⏭️ SKIP not expired yet");
    return { ok: true, skipped: true };
  }

  // Ensure plan populated
  if (!sub.plan || !sub.plan.billingType) {
    await step(ctx, "mongo:populatePlan", async () => sub.populate("plan"));
  }

  const plan = sub.plan;
  const firebaseUid = sub.firebaseUid;

  // Firebase email (may be null)
  const email = await getUserEmailFromFirebase(firebaseUid, ctx);

  log(ctx, "➡️ Expiring subscription", {
    status: sub.status,
    planCode: plan?.code,
    billingType: plan?.billingType,
    emailFound: !!email,
    dryRun,
  });

  // Mark expired in DB (or dry run)
  await step(
    ctx,
    dryRun ? "DRYRUN mongo:markExpired" : "mongo:markExpired",
    async () => {
      if (dryRun) return;

      sub.isActive = false;
      sub.isCurrent = false;
      sub.endedAt = sub.currentPeriodEnd || now;
      await sub.save();
    }
  );

  // Trial flow
  if (sub.status === "trial") {
    log(ctx, "🧪 Trial expired → moving to FREE", { emailUsed: !!email });

    await step(
      ctx,
      dryRun
        ? "DRYRUN subscription:moveToFreePlan"
        : "subscription:moveToFreePlan",
      async () => {
        if (dryRun) return;
        await SubscriptionService.moveToFreePlan(firebaseUid, email);
      }
    );

    return { ok: true, movedToFree: true, flow: "trial" };
  }

  // Paid recurring flow
  if (sub.status === "active" && plan && plan.billingType === "recurring") {
    if (email) {
      await step(
        ctx,
        dryRun
          ? "DRYRUN email:sendSubscriptionExpiredEmail"
          : "email:sendSubscriptionExpiredEmail",
        async () => {
          if (dryRun) return;
          await EmailService.sendSubscriptionExpiredEmail(email, plan);
        }
      );
    } else {
      log(ctx, "📭 No email in Firebase; skipping expired email");
    }

    await step(
      ctx,
      dryRun
        ? "DRYRUN subscription:moveToFreePlan(noEmail)"
        : "subscription:moveToFreePlan(noEmail)",
      async () => {
        if (dryRun) return;
        await SubscriptionService.moveToFreePlan(firebaseUid, null);
      }
    );

    return { ok: true, movedToFree: true, flow: "paidRecurring" };
  }

  // Anything else
  log(ctx, "ℹ️ No action for this subscription state", {
    status: sub.status,
    billingType: plan?.billingType,
  });

  return { ok: true, noAction: true, flow: "other" };
}

/* -------------------- Job runner -------------------- */
async function runJobOnce(opts = {}) {
  const startedAt = Date.now();
  const now = new Date();

  const query = {
    isActive: true,
    currentPeriodEnd: { $lte: now },
    status: { $in: ["trial", "active"] },
  };

  const candidates = await subscriptionModel
    .find(query)
    .populate("plan")
    .exec();

  console.log(
    `\n${nowIso()} [run=${RUN_ID}] 🔍 Found ${
      candidates.length
    } subscriptions to process at ${now.toISOString()}`
  );

  const limit = Number(opts.limit || 0);
  const list = limit > 0 ? candidates.slice(0, limit) : candidates;

  if (limit > 0) {
    console.log(
      `${nowIso()} [run=${RUN_ID}] 🧪 LIMIT enabled: processing only ${
        list.length
      }/${candidates.length}`
    );
  }

  const summary = {
    totalFound: candidates.length,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    movedToFree: 0,
    flows: { trial: 0, paidRecurring: 0, other: 0 },
  };

  for (let i = 0; i < list.length; i++) {
    const sub = list[i];
    summary.processed++;

    try {
      const res = await processSingleSubscription(sub, i + 1, opts);
      summary.success++;
      if (res?.skipped) summary.skipped++;
      if (res?.movedToFree) summary.movedToFree++;
      if (res?.flow && summary.flows[res.flow] !== undefined)
        summary.flows[res.flow]++;
    } catch (err) {
      summary.failed++;
      // We already print deep error logs in step() / logErr()
      console.error(
        `${nowIso()} [run=${RUN_ID} sub=${
          sub?._id
        }] ❌ processing failed, continuing...`
      );
    }
  }

  console.log(
    `\n${nowIso()} [run=${RUN_ID}] ✅ Subscription expiry job completed in ${ms(
      Date.now() - startedAt
    )}`
  );
  console.log(`${nowIso()} [run=${RUN_ID}] 📊 SUMMARY:`, summary);

  return summary;
}

/* -------------------- Entrypoint -------------------- */
async function main() {
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : 0;

  console.log(
    `${nowIso()} [run=${RUN_ID}] 🚀 starting job (dryRun=${dryRun}, limit=${
      limit || "none"
    })`
  );

  try {
    await step(
      { subId: "-", uid: "-", idx: "-" },
      "mongo:connectDb",
      async () => connectDb()
    );

    // ✅ return summary so API can store it
    const summary = await runJobOnce({ dryRun, limit });
    return { runId: RUN_ID, summary };
  } catch (err) {
    console.error(`${nowIso()} [run=${RUN_ID}] ❌ Job failed (top-level)`);
    console.error(err);

    // ✅ return error info too (endpoint can persist)
    return {
      runId: RUN_ID,
      summary: null,
      error: err?.message || String(err),
    };
  }
}

module.exports = main;

if (require.main === module) {
  main()
    .then((out) => {
      console.log(`${nowIso()} [run=${RUN_ID}] 🧾 FINAL RESULT:`, out);
      process.exit(out?.error ? 1 : 0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
