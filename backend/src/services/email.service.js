const path = require("path");
const ejs = require("ejs");
const { emailConfig } = require("../config"); // nodemailer transport
const {
  EMAIL_USER,
  EMAIL_SENDER_NAME,
  FRONTEND_URL,
} = require("../config/env.config");

const SUPPORT_EMAIL = EMAIL_USER || "support@halallens.org";

const TEMPLATE_PATH = path.join(__dirname, "..", "email-templates", "base.ejs");

// helper: render the shared EJS layout
async function renderBaseTemplate(viewModel) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(TEMPLATE_PATH, viewModel, (err, html) => {
      if (err) return reject(err);
      resolve(html);
    });
  });
}

const EmailService = {
  sendEmail: async (to, subject, html, text = "") => {
    const msg = {
      from: `"${EMAIL_SENDER_NAME}" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };
    return await emailConfig.sendMail(msg);
  },

  // 1) Trial activation (on signup)
  sendTrialActivationEmail: async (to, plan, trialEndDate) => {
    const end = trialEndDate
      ? new Date(trialEndDate).toLocaleDateString()
      : "in 7 days";
    const subject = "Your Halal Lens trial is now active";

    const html = await renderBaseTemplate({
      subject,
      preheader: "Your Halal Lens trial is now active.",
      title: "Your Halal Lens trial is now active",
      introLines: [
        "Assalamualaikum,",
        "Your Halal Lens trial is now active and ready to use.",
      ],
      detailTitle: "Trial Details",
      detailItems: [
        { label: "Plan", value: plan?.name || "7-day Trial" },
        { label: "Usage", value: "10 scans per day" },
        { label: "Trial ends on", value: end },
      ],
      ctaUrl: `${FRONTEND_URL}/billing`,
      ctaLabel: "View plans & usage",
      footerNote:
        "You can continue using the app normally. After your trial ends, your account will automatically move to the free plan (2 scans per day). You can upgrade anytime from the website.",
      supportEmail: SUPPORT_EMAIL,
      supportUrl: `${FRONTEND_URL}/support`,
    });

    return EmailService.sendEmail(to, subject, html);
  },

  // 3) Trial ended → moved to free (called in moveToFreePlan)
  sendTrialEndedNowOnFreeEmail: async (to, freePlan) => {
    const subject = "Your Halal Lens trial has ended";

    const html = await renderBaseTemplate({
      subject,
      preheader: "Your Halal Lens trial has ended.",
      title: "Your trial has ended – you’re now on Free plan",
      introLines: [
        "Assalamualaikum,",
        `Your Halal Lens trial has ended, and your account is now on the ${
          freePlan?.name || "Free plan"
        }.`,
      ],
      detailTitle: "Current Plan",
      detailItems: [
        { label: "Plan", value: freePlan?.name || "Free plan" },
        { label: "Usage", value: "2 scans per day" },
      ],
      ctaUrl: `${FRONTEND_URL}/billing`,
      ctaLabel: "View paid plans",
      footerNote:
        "You can upgrade anytime to a Standard Monthly or Yearly plan and get 20 scans per day.",
      supportEmail: SUPPORT_EMAIL,
      supportUrl: `${FRONTEND_URL}/support`,
    });

    return EmailService.sendEmail(to, subject, html);
  },

  // 4) Plan purchase confirmation (called from Stripe webhook)
  sendPlanPurchaseConfirmationEmail: async (to, plan, periodEnd) => {
    const end = periodEnd
      ? new Date(periodEnd).toLocaleDateString()
      : "the end of your billing period";
    const subject = "Your Halal Lens subscription is active";

    const html = await renderBaseTemplate({
      subject,
      preheader: "Your Halal Lens subscription is now active.",
      title: "Thank you for subscribing to Halal Lens",
      introLines: [
        "Assalamualaikum,",
        `Thank you for purchasing the ${
          plan?.name || "Standard plan"
        } on Halal Lens.`,
      ],
      detailTitle: "Subscription Details",
      detailItems: [
        { label: "Plan", value: plan?.name || "Standard" },
        {
          label: "Scans per day",
          value: String(plan?.scansPerDay || 20),
        },
        {
          label: "Valid until",
          value: end,
        },
      ],
      ctaUrl: `${FRONTEND_URL}/billing`,
      ctaLabel: "Manage subscription",
      footerNote:
        "Your app will automatically reflect your new plan limits. If you don’t see changes, please sign out and sign in again.",
      supportEmail: SUPPORT_EMAIL,
      supportUrl: `${FRONTEND_URL}/support`,
    });

    return EmailService.sendEmail(to, subject, html);
  },

  // 6) Subscription expired (to be triggered after expiry)
  sendSubscriptionExpiredEmail: async (to, plan) => {
    const subject = "Your Halal Lens subscription has expired";

    const html = await renderBaseTemplate({
      subject,
      preheader: "Your Halal Lens subscription has expired.",
      title: "Your subscription has expired",
      introLines: [
        "Assalamualaikum,",
        `Your Halal Lens ${plan?.name || "subscription"} has expired.`,
      ],
      detailTitle: "Current Status",
      detailItems: [
        {
          label: "Plan status",
          value:
            "Your account may now be on the free plan with limited scans per day.",
        },
      ],
      ctaUrl: `${FRONTEND_URL}/billing`,
      ctaLabel: "View plans & upgrade",
      footerNote:
        "You can reactivate a paid plan anytime from the billing page if you’d like to regain higher scan limits.",
      supportEmail: SUPPORT_EMAIL,
      supportUrl: `${FRONTEND_URL}/support`,
    });

    return EmailService.sendEmail(to, subject, html);
  },

  // 7) Account deletion request email
  sendAccountDeletionEmail: async (to) => {
    const subject = "We received your Halal Lens account deletion request";

    const html = await renderBaseTemplate({
      subject,
      preheader: "Your Halal Lens account deletion request has been received.",
      title: "Your account deletion request is in process",
      introLines: [
        "Assalamualaikum,",
        "We have received your request to delete your Halal Lens account.",
        "Your account will be permanently deleted within the next 30 days.",
      ],
      detailTitle: "Important Information",
      detailItems: [
        {
          label: "Deletion timeline",
          value: "Your account will be permanently deleted within 30 days.",
        },
        {
          label: "Need to cancel deletion?",
          value:
            "If you change your mind within this period, please contact our support team to restore your account before deletion is finalized.",
        },
      ],
      ctaUrl: `${FRONTEND_URL}/support`,
      ctaLabel: "Contact Support",
      footerNote:
        "If you did not request this deletion or believe this was done in error, please contact us immediately.",
      supportEmail: SUPPORT_EMAIL,
      supportUrl: `${FRONTEND_URL}/support`,
    });

    return EmailService.sendEmail(to, subject, html);
  },
};

module.exports = EmailService;
