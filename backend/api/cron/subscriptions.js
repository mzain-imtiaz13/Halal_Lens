// api/cron/subscriptions.js
module.exports = async (req, res) => {
  const run = require("../../src/scripts/subscription-expiry.script")
  try {
    await run(); // Must export a function, not auto-execute
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
