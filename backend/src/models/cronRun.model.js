// models/cronRun.model.js
const mongoose = require("mongoose");

const CronRunSchema = new mongoose.Schema(
  {
    job: { type: String, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    ok: { type: Boolean, default: false },
    summary: { type: Object },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CronRun", CronRunSchema);
