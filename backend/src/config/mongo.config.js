const { MONGO_URI } = require("./env.config");

const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // 5s to find a server
  connectTimeoutMS: 5000,         // 5s TCP timeout
};
const mongoose = {
  url: MONGO_URI,
  options: mongoOptions,
};

module.exports = mongoose;
