// api/[...path].js
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const { envConfig, mongoConfig } = require("../src/config");
const app = require("../src");
const { seedPlans } = require("../src/seeder/plan.seeder");

let serverlessHandler = null;
let dbConnPromise = null;
let hasSeededPlans = false;

// Connect once + seed once (similar to www.js but serverless-safe)
async function connectDbAndMaybeSeed() {
  if (!dbConnPromise) {
    dbConnPromise = mongoose
      .connect(mongoConfig.url, mongoConfig.options)
      .then(async () => {
        console.log("✅ MongoDB connected (Vercel)");

        if (!hasSeededPlans) {
          try {
            await seedPlans();
            hasSeededPlans = true;
            console.log("✅ Default plans seeded/updated (Vercel)");
          } catch (err) {
            // Log seeding failure but don't crash the function
            console.error("❌ Failed to seed plans on Vercel:", err);
          }
        }
      })
      .catch((err) => {
        console.error("❌ Failed to connect database on Vercel:\n", err);
        // rethrow so the caller can respond 500
        throw err;
      });
  }

  return dbConnPromise;
}

module.exports = async (req, res) => {
  try {
    await connectDbAndMaybeSeed();

    if (!serverlessHandler) {
      serverlessHandler = serverless(app, {
        // optional: preserve req.url exactly as Vercel passes it
        request: (req_) => req_,
        response: (res_) => res_,
      });
    }

    return serverlessHandler(req, res);
  } catch (error) {
    console.error("❌ Unhandled error in Vercel handler:", error);

    // Basic fallback 500 response (so we don't just time out)
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: "Internal server error",
        // in prod you probably don't want to expose details
        error:
          envConfig.NODE_ENV === "development" ? error.message : undefined,
      })
    );
  }
};
