const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const routes = require("./routes");
const { R5XX } = require("./Responses");
const stripeWebhookHandler = require("./controllers/stripe.controller");
const { connectDb } = require("./config/db.config");

const app = express();

app.set("view engine", "ejs");

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
    await connectDb();           // ensures Mongo is connected + plans seeded
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

// Error catching middleware
app.use((error, req, res, next) => {
  console.log(error);
  R5XX(res, { error: error?.message });
});

module.exports = app;
