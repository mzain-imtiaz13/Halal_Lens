const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const routes = require("./routes");
const { R5XX } = require("./Responses");
const stripeWebhookHandler = require("./controllers/stripe.controller");
const { connectDb } = require("./config/db.config");
const runSubscriptionExpiry = require("./scripts/subscription-expiry.script");
const { CronRun } = require("./models");

const app = express();

app.set("view engine", "ejs");
app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});
// Stripe webhook (no /api prefix here)
app.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

app.use(express.json());
app.use(cors());
app.set("trust proxy", true);
app.use(morgan("tiny"));
app.use(async (req, res, next) => {
  try {
    await connectDb(); // ensures Mongo is connected + plans seeded
    return next();
  } catch (err) {
    console.error("❌ DB middleware error:", err);
    return res
      .status(500)
      .json({ message: "Database connection error", error: err.message });
  }
});
// Mount routes at root – Vercel already gives you /api prefix
app.use("/", routes);

// Static
app.use(express.static(__dirname + "/public"));

// Health
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/cron/subscriptions", async (req, res) => {
  const startedAt = new Date();
  const run = await CronRun.create({ job: "subscription-expiry", startedAt });

  try {
    const result = await runSubscriptionExpiry();
    // result = { runId, summary, error }

    run.endedAt = new Date();
    run.ok = !result.error;
    run.summary = result.summary;
    run.error = result.error || null;
    await run.save();

    return res.json({ success: run.ok, runId: run._id, result });
  } catch (err) {
    run.endedAt = new Date();
    run.ok = false;
    run.error = err?.message || String(err);
    await run.save();
    return res
      .status(500)
      .json({ success: false, runId: run._id, error: run.error });
  }
});

// Error catching middleware
app.use((error, req, res, next) => {
  console.log(error);
  R5XX(res, { error: error?.message });
});

module.exports = app;
