const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-950 flex flex-col">

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          <div className="bg-white border border-emerald-100 rounded-3xl shadow-sm p-6 md:p-8">
            {/* Title */}
            <header className="mb-6 md:mb-8 border-b border-emerald-100 pb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-950 mb-2">
                Terms of Service — Halal Lens
              </h1>
              <p className="text-xs md:text-sm text-emerald-700">
                Last updated: 28 November 2025
              </p>
              <p className="mt-4 text-sm text-emerald-800 leading-relaxed">
                These Terms of Service (“Terms”) govern your access to and use
                of the Halal Lens mobile application (“App”), operated by
                Prince Faisal (“we,” “our,” or “us”). By downloading or using
                the App, you agree to be bound by these Terms.
              </p>
            </header>

            <div className="space-y-6 md:space-y-8 text-sm text-emerald-900 leading-relaxed">
              {/* 1. Eligibility */}
              <section id="eligibility">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  1. Eligibility
                </h2>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>You must be at least 13 years old to use this App.</li>
                  <li>
                    If you are under 18, you must use the App under the
                    supervision of a parent or legal guardian.
                  </li>
                </ul>
              </section>

              {/* 2. Account Registration */}
              <section id="account-registration">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  2. Account Registration
                </h2>
                <p className="mb-2 text-emerald-800">
                  To access certain features, you may be required to create an
                  account using a valid email address, Google Sign-In, or Apple
                  Sign-In.
                </p>
                <p className="mb-1 text-emerald-800">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>Keeping your account information secure</li>
                  <li>All activities performed under your account</li>
                </ul>
              </section>

              {/* 3. User Responsibilities */}
              <section id="user-responsibilities">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  3. User Responsibilities
                </h2>
                <p className="mb-1 text-emerald-800">
                  You agree to use the App only for lawful purposes. You may
                  NOT:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>Upload false, misleading, harmful, or inappropriate content</li>
                  <li>Attempt to access another user’s account</li>
                  <li>Attempt to disrupt, damage, or interfere with the App</li>
                  <li>Reverse engineer, copy, or modify the App</li>
                  <li>
                    Use bots, scrapers, or automated tools without permission
                  </li>
                </ul>
              </section>

              {/* 4. Permissions */}
              <section id="permissions">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  4. Permissions
                </h2>
                <p className="mb-1 text-emerald-800">
                  The App may request access to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>Camera (for scanning barcodes)</li>
                  <li>Storage (to save temp data)</li>
                  <li>Internet (to fetch ingredient details)</li>
                </ul>
                <p className="mt-2 text-emerald-800">
                  You may manage permissions in your device settings.
                </p>
              </section>

              {/* 5. Halal Classification Disclaimer */}
              <section id="halal-disclaimer">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  5. Halal Classification Disclaimer
                </h2>
                <p className="mb-2 text-emerald-800">
                  Halal Lens provides AI-assisted halal/haram/suspicious
                  classifications based on ingredient data, public databases,
                  and AI interpretation.
                </p>
                <p className="mb-1 text-emerald-800">You understand that:</p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>Results may not always be accurate</li>
                  <li>Ingredient sources may be unclear or incomplete</li>
                  <li>Manufacturers may change formulas</li>
                  <li>The App does not provide religious rulings (fatwas)</li>
                  <li>Your final decision is your own responsibility.</li>
                </ul>
              </section>

              {/* 6. Data & Privacy */}
              <section id="data-privacy">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  6. Data &amp; Privacy
                </h2>
                <p className="mb-2 text-emerald-800">
                  Your data is handled in accordance with our Privacy Policy.
                </p>
                <p className="mb-1 text-emerald-800">
                  We use Firebase services for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>Authentication</li>
                  <li>Database storage</li>
                </ul>
                <p className="mt-2 text-emerald-800">
                  You may request deletion of your data at any time.
                </p>
              </section>

              {/* 7. Intellectual Property */}
              <section id="intellectual-property">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  7. Intellectual Property
                </h2>
                <p className="text-emerald-800">
                  All trademarks, content, data logic, and branding within the
                  App remain the property of Prince Faisal. You may not copy,
                  modify, or distribute any part of the App without our
                  permission.
                </p>
              </section>

              {/* 8. Termination */}
              <section id="termination">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  8. Termination
                </h2>
                <p className="mb-1 text-emerald-800">
                  We may suspend or terminate your account if you:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>Violate these Terms</li>
                  <li>Misuse the App</li>
                  <li>Engage in harmful or suspicious activity</li>
                </ul>
                <p className="mt-2 text-emerald-800">
                  You may request account deletion by contacting us.
                </p>
              </section>

              {/* 9. Limitation of Liability */}
              <section id="limitation-liability">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  9. Limitation of Liability
                </h2>
                <p className="mb-1 text-emerald-800">
                  We are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li>Incorrect halal classifications</li>
                  <li>
                    Any damages or losses resulting from your use of the App
                  </li>
                  <li>
                    Mistakes from ingredient databases or third-party sources
                  </li>
                </ul>
                <p className="mt-2 text-emerald-800">
                  The App is provided “as is” and “as available.”
                </p>
              </section>

              {/* 10. Updates to These Terms */}
              <section id="updates">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  10. Updates to These Terms
                </h2>
                <p className="text-emerald-800">
                  We may update these Terms periodically. Continued use of the
                  App after updates means you accept the new Terms.
                </p>
              </section>

              {/* 11. Contact Us */}
              <section id="contact">
                <h2 className="font-semibold text-emerald-950 mb-2">
                  11. Contact Us
                </h2>
                <p className="text-emerald-800">
                  For questions, support, or account deletion, contact us at:
                </p>
                <p className="mt-2 text-emerald-900 font-semibold">
                  📧 halallensofficial@gmail.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
