// src/pages/DataDeletion.jsx
import React from "react";

const GOOGLE_FORM_URL = "https://forms.gle/ZhZoXjRc5HWDtunv8";
import './../styles.css'
export default function DataDeletion() {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <p className="legal-app-name">Halal Lens</p>
          <h1 className="legal-hero-title">Data Deletion Request</h1>
          <p className="legal-hero-subtitle">
            Request permanent removal of your Halal Lens account and data.
          </p>
        </div>
      </header>

      <main className="legal-wrapper">
        <section className="legal-card">
          <p className="legal-meta">
            <strong>Halal Lens – Data Deletion Request</strong>
          </p>

          <p>
            We respect your privacy and give you full control over your personal
            data. If you no longer wish to use Halal Lens, you can request to
            delete your account and all related data by filling out the form
            below.
          </p>
          <p>
            Once your request is submitted, our team will verify your email and
            permanently delete your data within <strong>30 days</strong>.
          </p>

          {/* What will be deleted */}
          <h2 className="legal-section-title">🗑️ What Will Be Deleted</h2>
          <p>When your request is processed, we will permanently remove:</p>
          <ul className="legal-list">
            <li>Your user account (email and authentication details)</li>
            <li>Your scan history and product analysis results</li>
            <li>Your votes on ingredients (these are anonymized or deleted)</li>
            <li>Any uploaded product images and related metadata</li>
          </ul>

          {/* What may be retained temporarily */}
          <h2 className="legal-section-title">
            ⚙️ What May Be Retained Temporarily
          </h2>
          <p>For security and legal purposes:</p>
          <ul className="legal-list">
            <li>
              Backup logs may be retained for up to 30 days before being
              permanently deleted.
            </li>
            <li>
              Anonymous, aggregated statistics (like total vote counts) may
              remain but are not linked to your identity.
            </li>
          </ul>

          {/* Processing time */}
          <h2 className="legal-section-title">🕒 Processing Time</h2>
          <p>
            After verifying your email, your account and all associated data
            will be deleted within <strong>30 days</strong>.
          </p>

          {/* Contact / help */}
          <h2 className="legal-section-title">📩 Need Help?</h2>
          <p>
            If you have any issues submitting the form or wish to contact us
            directly, please email:
          </p>
          <p>
            📧{" "}
            <a href="mailto:halallensofficial@gmail.com" className="legal-link">
              halallensofficial@gmail.com
            </a>
          </p>
          <h2 className="legal-section-title">🧾 How to Request Deletion</h2>
          <ul className="legal-list">
            <li>
              <strong>Step 1:</strong> Fill out the form below with your account
              information.
            </li>
            <li>
              <strong>Step 2:</strong> Click “Submit” to initiate the account
              deletion process.
            </li>
            <li>
              <strong>Step 3:</strong> You will receive a confirmation email
              once your account has been deleted.
            </li>
          </ul>

          {/* Google Form embed */}
          <h2 className="legal-form-title">
            Submit Your Data Deletion Request
          </h2>
          <p className="legal-form-intro">
            Please complete the form below to confirm your identity and request
            permanent deletion of your Halal Lens account and data.
          </p>

          <div className="legal-form-frame-wrap">
            <iframe
              title="Halal Lens Data Deletion Request Form"
              src={GOOGLE_FORM_URL}
              className="legal-form-frame"
              loading="lazy"
            >
              Loading…
            </iframe>
          </div>
        </section>
      </main>
    </div>
  );
}
