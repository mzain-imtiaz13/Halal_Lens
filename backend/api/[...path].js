// api/[...path].js
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const { envConfig, mongoConfig } = require("../src/config");
const { seedPlans } = require("../src/seeder/plan.seeder");
const app = require("../src");

// Single shared handler & connection across invocations
let serverlessHandler = null;
let dbConnPromise = null;
let hasSeededPlans = false;

const MAX_DB_BOOT_MS = 8000; // hard cap to avoid Vercel 504

async function connectDbAndMaybeSeed() {
  // If we already have a connection attempt, reuse it
  if (dbConnPromise) {
    return dbConnPromise;
  }

  const connectPromise = mongoose
    .connect(mongoConfig.url, mongoConfig.options)
    .then(async () => {
      console.log("✅ MongoDB connected (Vercel)");

      if (!hasSeededPlans) {
        try {
          await seedPlans();
          hasSeededPlans = true;
          console.log("✅ Default plans seeded/updated (Vercel)");
        } catch (err) {
          console.error("❌ Failed to seed plans on Vercel:", err);
        }
      }
    })
    .catch((err) => {
      console.error("❌ Failed to connect database on Vercel:\n", err);
      // If connection fails, clear promise so we can retry next invocation
      dbConnPromise = null;
      throw err;
    });

  // Race the connect vs a manual timeout so we don't hang forever
  dbConnPromise = Promise.race([
    connectPromise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Mongo connection timeout in serverless")),
        MAX_DB_BOOT_MS
      )
    ),
  ]).catch((err) => {
    // If the race fails (timeout or connect error), clear for next time
    dbConnPromise = null;
    throw err;
  });

  return dbConnPromise;
}

module.exports = async (req, res) => {
  try {
    // Ensure DB is up (or fails fast)
    await connectDbAndMaybeSeed();

    if (!serverlessHandler) {
      serverlessHandler = serverless(app);
    }

    return serverlessHandler(req, res);
  } catch (error) {
    console.error("❌ Unhandled error in Vercel handler:", error);

    // Fallback 500 response so Vercel doesn't 504
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: "Internal server error",
        error:
          envConfig.NODE_ENV === "development" ? error.message : undefined,
      })
    );
  }
};
