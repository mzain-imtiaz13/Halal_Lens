// src/pages/DataDeletion.jsx
import React from 'react'

const GOOGLE_FORM_EMBED_URL =
  'https://forms.gle/ZhZoXjRc5HWDtunv8' // <- your form URL

const pageStyles = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    color: '#111827',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  },
  hero: {
    background:
      'linear-gradient(135deg, #0f172a 0%, #111827 40%, #0b1120 100%)',
    color: '#f9fafb',
    padding: '3.5rem 1.5rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '2.4rem',
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
  heroSubtitle: {
    marginTop: '0.75rem',
    fontSize: '0.95rem',
    opacity: 0.8,
  },
  cardWrapper: {
    maxWidth: '900px',
    margin: '-40px auto 40px',
    padding: '0 1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow:
      '0 18px 45px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(148, 163, 184, 0.25)',
    padding: '2.5rem 2.25rem',
    fontSize: '0.95rem',
    lineHeight: 1.7,
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginTop: '1.75rem',
    marginBottom: '0.5rem',
  },
  list: {
    paddingLeft: '1.2rem',
    marginTop: '0.35rem',
    marginBottom: '0.35rem',
  },
  listItem: {
    marginBottom: '0.25rem',
  },
  emailLink: {
    color: '#2563eb',
    textDecoration: 'none',
  },
  smallMeta: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  formSectionTitle: {
    marginTop: '2rem',
    marginBottom: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    textAlign: 'center',
  },
  formWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  iframe: {
    width: '100%',
    maxWidth: '640px',
    height: '900px',
    border: '0',
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
  },
}

export default function DataDeletion() {
  return (
    <div style={pageStyles.root}>
      <header style={pageStyles.hero}>
        <div style={pageStyles.heroTitle}>Data Deletion Request</div>
        <p style={pageStyles.heroSubtitle}>
          Request removal of your Halal Lens account and associated data.
        </p>
      </header>

      <div style={pageStyles.cardWrapper}>
        <main style={pageStyles.card}>
          <p style={pageStyles.smallMeta}>
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
          <h2 style={pageStyles.sectionTitle}>🗑️ What Will Be Deleted</h2>
          <p>When your request is processed, we will permanently remove:</p>
          <ul style={pageStyles.list}>
            <li style={pageStyles.listItem}>
              Your user account (email and authentication details)
            </li>
            <li style={pageStyles.listItem}>
              Your scan history and product analysis results
            </li>
            <li style={pageStyles.listItem}>
              Your votes on ingredients (these are anonymized or deleted)
            </li>
            <li style={pageStyles.listItem}>
              Any uploaded product images and related metadata
            </li>
          </ul>

          {/* What may be retained temporarily */}
          <h2 style={pageStyles.sectionTitle}>
            ⚙️ What May Be Retained Temporarily
          </h2>
          <p>For security and legal purposes:</p>
          <ul style={pageStyles.list}>
            <li style={pageStyles.listItem}>
              Backup logs may be retained for up to 30 days before being
              permanently deleted.
            </li>
            <li style={pageStyles.listItem}>
              Anonymous, aggregated statistics (like total vote counts) may
              remain but are not linked to your identity.
            </li>
          </ul>

          {/* Processing time */}
          <h2 style={pageStyles.sectionTitle}>🕒 Processing Time</h2>
          <p>
            After verifying your email, your account and all associated data
            will be deleted within <strong>30 days</strong>.
          </p>

          {/* Contact / help */}
          <h2 style={pageStyles.sectionTitle}>📩 Need Help?</h2>
          <p>
            If you have any issues submitting the form or wish to contact us
            directly, please email:
          </p>
          <p>
            📧{' '}
            <a
              href="mailto:majidnaru69@gmail.com"
              style={pageStyles.emailLink}
            >
              majidnaru69@gmail.com
            </a>
          </p>

          {/* Google Form embed */}
          <h2 style={pageStyles.formSectionTitle}>
            Submit Your Data Deletion Request
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            Please complete the form below to confirm your identity and request
            permanent deletion of your Halal Lens account and data.
          </p>
          <div style={pageStyles.formWrapper}>
            <iframe
              title="Halal Lens Data Deletion Request Form"
              src={GOOGLE_FORM_EMBED_URL}
              style={pageStyles.iframe}
              loading="lazy"
            >
              Loading…
            </iframe>
          </div>
        </main>
      </div>
    </div>
  )
}
