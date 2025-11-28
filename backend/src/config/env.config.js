const Joi = require("joi");

const envFiles = {
  development: ".env.development",
  production: ".env.production",
};
const env = process.env.NODE_ENV || "development";
const path = envFiles[env]
console.log(path)
require("dotenv").config({ path: envFiles.development });
const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3000),
    MONGO_URI: Joi.string().required().description("Mongo DB url"),
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().required(),
    EMAIL_USER: Joi.string().required(),
    EMAIL_PASS: Joi.string().required(),
    FRONTEND_URL: Joi.string().required(),
  })
  .unknown();

const { error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL;

module.exports = {
  PORT,
  MONGO_URI,
  SMTP_HOST,
  SMTP_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  FRONTEND_URL,
};
