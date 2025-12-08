const Support = () => {
  return (
    <div className="min-h-screen bg-green-50 text-green-950 flex items-start justify-center px-4 py-10 md:py-14">
      <div className="w-full max-w-3xl bg-white border border-green-100 rounded-3xl shadow-sm p-6 md:p-8">
        {/* Title */}
        <section className="mb-6 md:mb-8 border-b border-green-100 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-green-950 mb-2">
            Halal Lens – Support &amp; Help
          </h1>
          <p className="text-sm text-green-800 leading-relaxed">
            Welcome to the Halal Lens support page. If you need assistance with
            using the app, scanning products, or understanding ingredient
            analysis, you can reach us anytime.
          </p>
        </section>

        <div className="space-y-6 md:space-y-8 text-sm text-green-900 leading-relaxed">
          {/* Contact Us */}
          <section>
            <h2 className="font-semibold text-green-950 mb-2">Contact Us</h2>
            <p className="text-green-800 mb-2">
              If you have questions or need help, feel free to contact us:
            </p>
            <p className="text-green-900 font-semibold">
              Email: <span className="underline">support@halallens.org</span>
            </p>
            <p className="mt-2 text-green-800">
              Our team usually responds within 24–48 hours.
            </p>
          </section>

          {/* About Halal Lens */}
          <section>
            <h2 className="font-semibold text-green-950 mb-2">
              About Halal Lens
            </h2>
            <p className="text-green-800 mb-2">
              Halal Lens helps you check product ingredients quickly and easily
              using:
            </p>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>Barcode scanning</li>
              <li>AI-powered ingredient analysis</li>
              <li>Halal, suspicious, and haram classification</li>
              <li>Product detail pages with full ingredient breakdown</li>
              <li>Scan history (for logged-in users)</li>
            </ul>
            <p className="mt-2 text-green-800">
              We continuously improve our ingredient database and AI accuracy to
              offer clearer insights.
            </p>
          </section>

          {/* Common Questions */}
          <section>
            <h2 className="font-semibold text-green-950 mb-2">
              Common Questions
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-green-800">
              <li>
                <p className="font-semibold">
                  Why do I need to create an account?
                </p>
                <p className="text-sm font-normal">
                  An account helps you save your scan history and sync it across
                  devices.
                </p>
              </li>
              <li>
                <p className="font-semibold">
                  How accurate is the halal classification?
                </p>
                <p className="text-sm font-normal">
                  Results are based on ingredient analysis and may vary. Always
                  verify with trusted halal certification sources if needed.
                </p>
              </li>
              <li>
                <p className="font-semibold">
                  The app couldn’t detect a product—what should I do?
                </p>
                <p className="text-sm font-normal">
                  Send us the product name, barcode, and a photo of the
                  ingredients at our support email. We will review and update
                  it.
                </p>
              </li>
            </ol>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="font-semibold text-green-950 mb-2">Disclaimer</h2>
            <p className="text-green-800">
              Halal Lens provides ingredient-based AI analysis for informational
              purposes only. Classifications may differ based on product
              updates or incomplete data. We recommend verifying with reliable
              halal certification authorities when necessary.
            </p>
          </section>

          {/* Version Info */}
          <section>
            <h2 className="font-semibold text-green-950 mb-2">
              Version Information
            </h2>
            <p className="text-green-800">
              Current App Version: <span className="font-semibold">1.0.8</span>
            </p>
            <p className="mt-1 text-green-800">
              This page will update as new features are released.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Support;
