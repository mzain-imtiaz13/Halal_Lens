// backend/api/[...path].js
const serverless = require("serverless-http");
const app = require("../src");

module.exports = serverless(app);
