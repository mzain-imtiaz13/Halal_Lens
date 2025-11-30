// src/config/db.js
const mongoose = require("mongoose");
const { mongoConfig } = require("./");        // this should import your mongo.config.js
const { seedPlans } = require("../seeder/plan.seeder");

let isConnecting = false;
let hasSeededPlans = false;

async function connectDb() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return; // already connected
  }
  if (isConnecting) {
    // someone else is already connecting; just wait for that
    await waitForConnection();
    return;
  }

  isConnecting = true;

  const url = mongoConfig.url || "";
  const safeUrl = url.startsWith("mongodb") ? url.split("@").pop() : url;
  console.log("🔌 Connecting to Mongo host:", safeUrl);

  try {
    await mongoose.connect(mongoConfig.url, mongoConfig.options);
    console.log("✅ MongoDB connected. readyState:", mongoose.connection.readyState);

    if (!hasSeededPlans) {
      try {
        await seedPlans();
        hasSeededPlans = true;
        console.log("✅ Default plans seeded/updated");
      } catch (e) {
        console.error("❌ Failed to seed plans:", e);
      }
    }
  } catch (err) {
    console.error("❌ Mongo connection error:", err.name, err.message);
    throw err;
  } finally {
    isConnecting = false;
  }
}

function waitForConnection() {
  return new Promise((resolve, reject) => {
    const maxWaitMs = 8000;
    const start = Date.now();

    (function check() {
      const state = mongoose.connection.readyState;
      if (state === 1) return resolve();
      if (Date.now() - start > maxWaitMs) {
        return reject(new Error("Waited too long for Mongo connection"));
      }
      setTimeout(check, 100);
    })();
  });
}

module.exports = { connectDb };
