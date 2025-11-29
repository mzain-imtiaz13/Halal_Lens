// src/middlewares/maybeFirebaseAuth.js

const { auth } = require("../config/firebaseAdmin.config");


const maybeFirebaseAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  try {
    const token = header.split(" ")[1];
    req.user = await auth.verifyIdToken(token);
  } catch (err) {
    console.warn("Optional Firebase auth failed, ignoring:", err.message);
  }

  next();
};

module.exports = maybeFirebaseAuth;
