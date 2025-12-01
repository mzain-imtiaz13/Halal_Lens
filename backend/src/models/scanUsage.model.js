// models/scanUsage.model.js
const mongoose = require("mongoose");

const scanUsageSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    dateKey: {
      // e.g. "2025-12-01" (UTC-based)
      type: String,
      required: true,
    },
    used: {
      type: Number,
      default: 0,
    },
    // optional: snapshot of plan info used at the time
    planCode: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure 1 doc per user per date
scanUsageSchema.index({ firebaseUid: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("ScanUsage", scanUsageSchema);
