const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    }, // from Firebase Auth

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "free",
      ],
      default: "active",
    },

    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },

    cancelAtPeriodEnd: { type: Boolean, default: false },

    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
