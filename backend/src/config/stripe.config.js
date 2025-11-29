const Stripe = require("stripe");
const { STRIPE_SECRET_KEY } = require("./env.config");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

module.exports = stripe;
