// src/pages/DataDeletion.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import instance from "../api/axios";

const DataDeletion = () => {
  const { user, loading, logout } = useAuth();

  const [form, setForm] = useState({
    email: "",
    name: "",
    reason: "",
    confirm: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | "auth-error" | null

  const isAuthenticated = !!user;
  const formDisabled = !isAuthenticated;

  // Pre-populate from Firebase user when available
  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      email: user.email || prev.email,
      name: user.displayName || prev.name,
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // Require login to submit
    if (!user) {
      setStatus("auth-error");
      return;
    }

    // Basic validation
    if (!form.email || !form.name || !form.confirm) {
      setStatus("error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await instance.get("/user/disable");
      await logout();
      setStatus("success");
      setForm((prev) => ({
        ...prev,
        reason: "",
        confirm: false,
      }));
    } catch (err) {
      console.error("Error submitting deletion request:", err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const emailDisabled = !!user?.email || formDisabled; // always disabled if we know the email OR user not logged in
  const hasPrefilledName = !!user?.displayName;
  const nameDisabled = hasPrefilledName || formDisabled; // editable only when we don't have displayName and user is logged in

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-brand-700 text-sm">
          <span className="h-3 w-3 rounded-full bg-brand-500 animate-pulse" />
          <span>Loading account info…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-brand-950 flex flex-col">
      {/* Hero */}
      <header className="pt-4">
        <div className="max-w-4xl mx-auto p-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-600 mb-2">
            Halal Lens
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-950 mb-3">
            Data Deletion Request
          </h1>
          <p className="text-sm md:text-base text-brand-800 max-w-2xl">
            Request permanent removal of your Halal Lens account and all
            associated data.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-4">
          <section className="bg-white border border-brand-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-6 md:space-y-8">
            <div className="space-y-3 text-sm text-brand-900 leading-relaxed">
              <p className="text-xs font-semibold text-brand-700">
                <strong>Halal Lens – Data Deletion Request</strong>
              </p>

              <p>
                We respect your privacy and give you full control over your
                personal data. If you no longer wish to use Halal Lens, you can
                request to delete your account and all related data by filling
                out the form below.
              </p>
              <p>
                Once your request is submitted, our team will verify your email
                and permanently delete your data within <strong>30 days</strong>
                .
              </p>

              {/* What will be deleted */}
              <div>
                <h2 className="text-sm md:text-base font-semibold text-brand-950 mb-2">
                  🗑️ What Will Be Deleted
                </h2>
                <p className="mb-2">
                  When your request is processed, we will permanently remove:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your user account (email and authentication details)</li>
                  <li>Your scan history and product analysis results</li>
                  <li>
                    Your votes on ingredients (these are anonymized or deleted)
                  </li>
                  <li>
                    Any uploaded product images and related metadata where
                    technically possible
                  </li>
                </ul>
              </div>

              {/* Retention */}
              <div>
                <h2 className="text-sm md:text-base font-semibold text-brand-950 mb-2">
                  ⚙️ What May Be Retained Temporarily
                </h2>
                <p className="mb-2">For security and legal purposes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Backup logs may be retained for up to 30 days before being
                    permanently deleted.
                  </li>
                  <li>
                    Anonymous, aggregated statistics (like total vote counts)
                    may remain but are not linked to your identity.
                  </li>
                </ul>
              </div>

              {/* Processing time */}
              <div>
                <h2 className="text-sm md:text-base font-semibold text-brand-950 mb-2">
                  🕒 Processing Time
                </h2>
                <p>
                  After verifying your email, your account and all associated
                  data will be deleted within <strong>30 days</strong>.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-sm md:text-base font-semibold text-brand-950 mb-2">
                  📩 Need Help?
                </h2>
                <p className="mb-2">
                  If you have any issues submitting the form or wish to contact
                  us directly, please email:
                </p>
                <p className="text-sm">
                  📧{" "}
                  <a
                    href="mailto:support@halallens.org"
                    className="text-brand-700 underline hover:text-brand-600"
                  >
                    support@halallens.org
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-sm md:text-base font-semibold text-brand-950 mb-2">
                  🧾 How to Request Deletion
                </h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Step 1:</strong> Fill out the form below with your
                    account information.
                  </li>
                  <li>
                    <strong>Step 2:</strong> Click “Submit” to initiate the
                    account deletion process.
                  </li>
                  <li>
                    <strong>Step 3:</strong> You will receive a confirmation
                    email once your account has been deleted.
                  </li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="border-t border-brand-100 pt-6 md:pt-8">
              <h2 className="text-base md:text-lg font-semibold text-brand-950 mb-2">
                Submit Your Data Deletion Request
              </h2>
              <p className="text-sm text-brand-800 mb-4">
                Please complete the form below to confirm your identity and
                request permanent deletion of your Halal Lens account and data.
              </p>

              {/* Auth required notice */}
              {!isAuthenticated && (
                <p className="mb-4 text-xs text-brand-800 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
                  You need to be signed in to your Halal Lens account to submit
                  a data deletion request. Please sign in from the main app and
                  then return to this page.
                </p>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-4 md:space-y-5 max-w-xl"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-brand-800 mb-1"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={emailDisabled}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                      emailDisabled
                        ? "bg-brand-50 border-brand-200 text-brand-700 cursor-not-allowed"
                        : "bg-brand-50/40 border-brand-200"
                    }`}
                  />
                  {user && user.email && (
                    <p className="mt-1 text-[11px] text-brand-600">
                      This email is taken from your Halal Lens account and
                      cannot be changed here. If this is incorrect, please
                      contact support.
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-brand-800 mb-1"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    disabled={nameDisabled}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                      nameDisabled
                        ? "bg-brand-50 border-brand-200 text-brand-700 cursor-not-allowed"
                        : "bg-brand-50/40 border-brand-200"
                    }`}
                  />
                  {user ? (
                    hasPrefilledName ? (
                      <p className="mt-1 text-[11px] text-brand-600">
                        This name is taken from your Halal Lens profile. If you
                        need it changed, please contact support.
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-brand-600">
                        We couldn’t find a name on your profile. Please enter
                        your full name.
                      </p>
                    )
                  ) : null}
                </div>

                {/* Reason (optional) */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-xs font-semibold text-brand-800 mb-1"
                  >
                    Reason for deletion{" "}
                    <span className="text-brand-500 text-[10px]">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Let us know why you’re leaving (optional)"
                    disabled={formDisabled}
                    className={`w-full rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none ${
                      formDisabled
                        ? "bg-brand-50 text-brand-700 cursor-not-allowed"
                        : "bg-brand-50/40"
                    }`}
                  />
                </div>

                {/* Confirmation */}
                <div className="border border-brand-100 rounded-xl bg-brand-50/60 px-3 py-3">
                  <label className="flex items-start gap-2 text-xs text-brand-900">
                    <input
                      type="checkbox"
                      name="confirm"
                      checked={form.confirm}
                      onChange={handleChange}
                      disabled={formDisabled}
                      className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed"
                      required
                    />
                    <span>
                      <span className="font-semibold">Confirmation *</span>
                      <br />I confirm that I want to permanently delete my
                      account and associated data.
                    </span>
                  </label>
                </div>

                {/* Status messages */}
                {status === "success" && (
                  <p className="text-xs text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
                    Thank you. Your deletion request has been submitted. Our
                    team will process it within 30 days.
                  </p>
                )}
                {status === "error" && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    Please make sure all required fields are filled and try
                    again. If the problem continues, contact
                    support@halallens.org.
                  </p>
                )}
                {status === "auth-error" && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    You must be signed in to submit a data deletion request.
                    Please sign in to your Halal Lens account and then try
                    again.
                  </p>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting || formDisabled}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {formDisabled
                      ? "Sign in to submit"
                      : submitting
                      ? "Submitting..."
                      : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        reason: "",
                        confirm: false,
                      }))
                    }
                    className="text-xs text-brand-800 underline hover:text-brand-600"
                  >
                    Clear form
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DataDeletion;
