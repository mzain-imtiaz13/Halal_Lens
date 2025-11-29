const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // e.g. STANDARD_MONTHLY
    description: { type: String },

    billingType: {
      type: String,
      enum: ["trial", "free", "recurring"],
      required: true,
    }, // trial / free / recurring

    interval: {
      type: String,
      enum: [null, "month", "year"],
      default: null,
    }, // only for recurring

    price: { type: Number, default: 0 }, // in USD (or whatever)
    currency: { type: String, default: "usd" },

    scansPerDay: { type: Number, required: true },

    trialDays: { type: Number, default: 0 }, // for trial plan only

    stripeProductId: { type: String },
    stripePriceId: { type: String }, // for recurring plans

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
