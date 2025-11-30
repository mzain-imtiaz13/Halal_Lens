// backend/api/[...path].js
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const { envConfig, mongoConfig } = require("../src/config");
const { seedPlans } = require("../src/seeder/plan.seeder");
const app = require("../src");

let serverlessHandler = null;
let isDbReady = false;

async function connectDbAndSeedOnce() {
  if (isDbReady) return;

  const url = mongoConfig.url || "";
  const safeUrl = url.startsWith("mongodb")
    ? url.split("@").pop()
    : url;

  console.log("Mongo URL host (Vercel):", safeUrl);

  try {
    await mongoose.connect(mongoConfig.url, {
      ...mongoConfig.options,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB connected (Vercel)");

    await seedPlans();
    console.log("✅ Default plans seeded/updated (Vercel)");

    isDbReady = true;
  } catch (err) {
    console.error("❌ MongoDB connect/seed failed (Vercel):", err.name, err.message);
    throw err;
  }
}

module.exports = async (req, res) => {
  try {
    await connectDbAndSeedOnce();

    if (!serverlessHandler) {
      serverlessHandler = serverless(app);
    }

    return serverlessHandler(req, res);
  } catch (error) {
    console.error("❌ Unhandled error in Vercel handler:", error);
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
