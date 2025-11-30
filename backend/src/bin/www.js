const mongoose = require("mongoose");
const app = require("../index");
const { envConfig, mongoConfig } = require("../config/");
const { seedPlans } = require("../seeder/plan.seeder");
const { connectDb } = require("../config/db.config");
// ---------------------------------------------------------------------------->>
let server = null;

(async () => {
  try {
    await connectDb();   // uses the same helper
    server = app.listen(envConfig.PORT, () => {
      console.log(`Listening to port ${server.address().port}`);
    });
  } catch (err) {
    console.log("Failed to start server.\n", err);
  }
})();
// ---------------------------------------------------------------------------->>
const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error(error);
  exitHandler();
};
// ---------------------------------------------------------------------------->>
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
