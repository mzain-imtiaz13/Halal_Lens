const nodemailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS } = require("./env.config");

const port = Number(SMTP_PORT || 465);
const secure = port === 465; // true for 465, false for 587

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },

  // ✅ prevents 2-minute hangs
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,

  // Zoho is usually fine without this, but can help with some networks
  tls: {
    servername: SMTP_HOST,
    minVersion: "TLSv1.2",
    // DO NOT set rejectUnauthorized:false unless you’re debugging a cert issue
  },
});

// Optional: run once on startup to confirm SMTP works
transport.verify((err, success) => {
  if (err) {
    console.error("[SMTP] verify failed:", {
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
    });
  } else {
    console.log("[SMTP] verify OK:", success);
  }
});

module.exports = transport;
