// src/pages/PrivacyPolicy.jsx
import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <p className="legal-app-name">Halal Lens</p>
          <h1 className="legal-hero-title">Privacy Policy</h1>
          <p className="legal-hero-subtitle">
            How we collect, use, and protect your personal data.
          </p>
        </div>
      </header>

      <main className="legal-wrapper">
        <section className="legal-card">
          <p className="legal-meta">
            <strong>Privacy Policy — Halal Lens</strong>
            <br />
            Last Updated:{' '}
            <time dateTime="2025-11-03">November 3, 2025</time>
          </p>

          <p>
            Welcome to <strong>Halal Lens</strong>. Halal Lens (&quot;we,&quot;
            &quot;our,&quot; or &quot;us&quot;) provides an AI-powered platform
            that allows users to scan or upload product information to determine
            whether items are Halal, Haram, or Suspicious based on ingredient
            analysis.
          </p>

          <p>
            This Privacy Policy explains how we collect, use, and protect your
            personal information when you use the Halal Lens mobile application.
          </p>

          <p>
            By creating an account or using Halal Lens, you agree to the terms
            outlined in this Privacy Policy.
          </p>

          {/* 1. Information We Collect */}
          <h2 className="legal-section-title">1. Information We Collect</h2>
          <p>
            We collect the following types of information to provide and improve
            our services:
          </p>

          <h3 className="legal-subtitle">1.1 Account Information</h3>
          <p>
            When you create an account using email and password or Google
            Sign-In, we collect your name, email address, and authentication
            details through Firebase Authentication.
          </p>

          <h3 className="legal-subtitle">1.2 Uploaded and Scanned Data</h3>
          <p>
            When you scan barcodes or upload product images, the app sends this
            data to our AI systems (OpenAI API) for ingredient analysis. These
            images or text inputs may be temporarily processed to identify
            product ingredients and generate a halal status.
          </p>

          <h3 className="legal-subtitle">1.3 Votes and Community Data</h3>
          <p>
            When you vote on ingredient halal status, we store your vote and
            user ID securely in Firebase Cloud Firestore. Your personal
            information is never publicly displayed — only total vote counts are
            shown to all users.
          </p>

          <h3 className="legal-subtitle">1.4 Device Information</h3>
          <p>
            We may collect basic device information such as model, OS version,
            and unique identifiers to ensure app stability and prevent abuse.
          </p>

          {/* 2. How We Use Your Information */}
          <h2 className="legal-section-title">2. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul className="legal-list">
            <li>
              Authenticate users and manage secure sign-ins.
            </li>
            <li>
              Process product scans and image uploads to determine halal status.
            </li>
            <li>
              Improve AI accuracy and maintain database quality.
            </li>
            <li>
              Display aggregated community votes and trending searches.
            </li>
            <li>
              Provide a personalized and consistent user experience.
            </li>
          </ul>
          <p>
            We <strong>do not</strong> sell, rent, or trade user data for
            marketing or advertising purposes.
          </p>

          {/* 3. Data Storage and Security */}
          <h2 className="legal-section-title">3. Data Storage and Security</h2>
          <p>
            All user data (account info, votes, scan history) is stored in
            Firebase Cloud Firestore under secure, encrypted connections.
          </p>
          <p>
            AI processing via OpenAI API is handled under secure HTTPS
            connections, and no personally identifiable information (PII) is
            shared.
          </p>
          <p>
            We take reasonable technical and organizational measures to prevent
            unauthorized access, loss, or misuse of your data.
          </p>

          {/* 4. Data Sharing */}
          <h2 className="legal-section-title">4. Data Sharing</h2>
          <p>We may share limited data only with:</p>
          <ul className="legal-list">
            <li>
              <strong>OpenAI</strong> – to process uploaded text or images for
              ingredient analysis.
            </li>
            <li>
              <strong>Firebase (Google LLC)</strong> – for authentication, cloud
              storage, and backend hosting.
            </li>
          </ul>
          <p>
            We do not share user information with advertisers, marketers, or
            unrelated third parties.
          </p>

          {/* 5. Your Rights and Choices */}
          <h2 className="legal-section-title">5. Your Rights and Choices</h2>
          <p>You can:</p>
          <ul className="legal-list">
            <li>
              Access or update your account information at any time within the
              app.
            </li>
            <li>
              Request deletion of your account and associated data by contacting
              us at{' '}
              <a
                href="mailto:majidnaru69@gmail.com"
                className="legal-link"
              >
                majidnaru69@gmail.com
              </a>
              .
            </li>
            <li>
              Withdraw your consent to data collection by deleting your account
              or uninstalling the app.
            </li>
          </ul>

          {/* 6. Children’s Privacy */}
          <h2 className="legal-section-title">6. Children’s Privacy</h2>
          <p>
            Halal Lens is intended for users aged 13 and above. We do not
            knowingly collect data from children under 13. If you believe a
            child has created an account, please contact us to remove the data
            immediately.
          </p>

          {/* 7. Data Retention */}
          <h2 className="legal-section-title">7. Data Retention</h2>
          <p>
            We retain your data as long as your account remains active. If you
            delete your account, your data and votes will be permanently deleted
            from our servers within 30 days.
          </p>

          {/* 8. Policy Updates */}
          <h2 className="legal-section-title">8. Policy Updates</h2>
          <p>
            We may update this Privacy Policy periodically. If we make
            significant changes, we will notify users via the app or email
            before the new policy takes effect.
          </p>

          {/* 9. Contact Us */}
          <h2 className="legal-section-title">9. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests related to privacy,
            please contact:
          </p>
          <p>
            📧 Email:{' '}
            <a
              href="mailto:majidnaru69@gmail.com"
              className="legal-link"
            >
              majidnaru69@gmail.com
            </a>
          </p>

          <p className="legal-footer-note">
            Halal Lens may update this policy as needed to stay compliant with
            legal and platform requirements (such as Google Play policies).
          </p>
        </section>
      </main>
    </div>
  )
}
