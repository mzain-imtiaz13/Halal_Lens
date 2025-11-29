require("dotenv").config();
const PlanService = require("../services/plan.service");

const seedPlans = async () => {
  try {
    console.log("✅ Connected to MongoDB");

    await PlanService.seedDefaultPlans();

    console.log("✅ Seeding done");
  } catch (err) {
    console.error("❌ Seed error:", err);
  }
};

module.exports = { seedPlans };
