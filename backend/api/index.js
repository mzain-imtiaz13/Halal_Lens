// api/index.js
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const { mongoConfig } = require("../src/config");
const app = require("../src");

let serverlessHandler;
let dbConn;

// Reuse Mongo connection across invocations
async function ensureDb() {
  if (!dbConn) {
    dbConn = mongoose.connect(mongoConfig.url, mongoConfig.options);
    await dbConn;
    console.log("✅ MongoDB connected (Vercel)");
  }
}

module.exports = async (req, res) => {
  await ensureDb();

  if (!serverlessHandler) {
    serverlessHandler = serverless(app);
  }

  return serverlessHandler(req, res);
};
