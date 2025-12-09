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
        "free",        
      ],
      default: "active",
    },

    // Current billing period (for trial or paid recurring)
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },

    cancelAtPeriodEnd: { type: Boolean, default: false },

    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },

    // NEW: marks if this row is logically the current subscription for the user
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },

    // NEW: is this subscription still "active/valid" right now?
    // e.g. expired trial or ended paid plan => isActive = false
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // NEW: when this subscription actually ended (for history)
    endedAt: { type: Date },
  },
  { timestamps: true }
);

// Optional, but useful if you ever want uniqueness constraints per user+stripe subscription
// subscriptionSchema.index({ firebaseUid: 1, stripeSubscriptionId: 1 }, { unique: false });

module.exports = mongoose.model("Subscription", subscriptionSchema);
