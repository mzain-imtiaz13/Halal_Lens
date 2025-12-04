const Joi = require("joi");

const dotenv = require("dotenv");

// Load .env locally. On Vercel, this does nothing if .env is missing
// and it WILL NOT override env vars that are already set.
dotenv.config();

// --------------------
// ENV VALIDATION SCHEMA
// --------------------
const envVarsSchema = Joi.object()
  .keys({
    // Server
    PORT: Joi.number().default(3000),
    MONGO_URI: Joi.string().required().description("MongoDB connection string"),

    // Email (SMTP)
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().required(),
    EMAIL_USER: Joi.string().required(),
    EMAIL_PASS: Joi.string().required(),
    EMAIL_SENDER_NAME: Joi.string().required(),

    FRONTEND_URL: Joi.string().required(),

    // Model
    GPT_MODEL: Joi.string().required(),

    // Stripe
    STRIPE_SECRET_KEY: Joi.string().required(),
    STRIPE_WEBHOOK_SECRET: Joi.string().required(),
    RECOVERY_CODE_FOR_STRIPE: Joi.string().optional(),

    STRIPE_PRICE_STANDARD_MONTHLY: Joi.string().required(),
    STRIPE_PRICE_STANDARD_YEARLY: Joi.string().required(),

    // Firebase Admin (Backend)
    FIREBASE_PROJECT_ID: Joi.string().required(),
    FIREBASE_PRIVATE_KEY: Joi.string().required(),
    FIREBASE_CLIENT_EMAIL: Joi.string().required(),

    // Optional Firebase meta fields
    FIREBASE_TYPE: Joi.string().optional(),
    FIREBASE_PRIVATE_KEY_ID: Joi.string().optional(),
    FIREBASE_CLIENT_ID: Joi.string().optional(),
    FIREBASE_AUTH_URI: Joi.string().optional(),
    FIREBASE_TOKEN_URI: Joi.string().optional(),
    FIREBASE_AUTH_PROVIDER_CERT_URL: Joi.string().optional(),
    FIREBASE_CLIENT_CERT_URL: Joi.string().optional(),
    FIREBASE_UNIVERSE_DOMAIN: Joi.string().optional(),
    FIREBASE_STORAGE_BUCKET: Joi.string().optional(),
    FIREBASE_DATABASE_URL: Joi.string().optional(),

    // Frontend firebase-style envs (optional)
    FIREBASE_API_KEY: Joi.string().optional(),
    FIREBASE_AUTH_DOMAIN: Joi.string().optional(),
    FIREBASE_MESSAGING_SENDER_ID: Joi.string().optional(),
    FIREBASE_APP_ID: Joi.string().optional(),
  })
  .unknown();

// Validate
const { error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export all env vars cleanly
module.exports = {
  // Basic
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,

  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_SENDER_NAME: process.env.EMAIL_SENDER_NAME,

  FRONTEND_URL: process.env.FRONTEND_URL,

  // Model
  GPT_MODEL: process.env.GPT_MODEL,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RECOVERY_CODE_FOR_STRIPE: process.env.RECOVERY_CODE_FOR_STRIPE,
  STRIPE_PRICE_STANDARD_MONTHLY: process.env.STRIPE_PRICE_STANDARD_MONTHLY,
  STRIPE_PRICE_STANDARD_YEARLY: process.env.STRIPE_PRICE_STANDARD_YEARLY,

  // Firebase Admin
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_TYPE: process.env.FIREBASE_TYPE,
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_CERT_URL: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  FIREBASE_CLIENT_CERT_URL: process.env.FIREBASE_CLIENT_CERT_URL,
  FIREBASE_UNIVERSE_DOMAIN: process.env.FIREBASE_UNIVERSE_DOMAIN,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,

  // Frontend-style Firebase keys
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
};
