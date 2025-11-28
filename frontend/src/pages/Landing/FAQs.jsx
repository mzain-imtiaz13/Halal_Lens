import { useState } from "react";

const FAQs = () => {
  const [activeFAQ, setActiveFAQ] = useState(0);

  const faqs = [
    {
      question: "What is Halal Lens?",
      answer:
        "Halal Lens is a mobile app that helps you verify whether a product is Halal, Haram, or Suspicious by scanning barcodes, QR codes, or uploading product images.",
    },
    {
      question: "How does the scanner work?",
      answer:
        "We read the barcode or QR code, match it with our database or Open Food Facts, and then analyze the ingredients to return a Halal verdict.",
    },
    {
      question: "Can I use the app without a barcode?",
      answer:
        "Yes. You can upload or capture a clear image of the product and ingredients. Our system will attempt to read and analyze them for you.",
    },
    {
      question: "How is the Halal status decided?",
      answer:
        "We combine ingredient databases, AI-based classification, and community voting. Admins can review and override final decisions when needed.",
    },
    {
      question: "Is Halal Lens available worldwide?",
      answer:
        "The app is designed to work globally, but coverage depends on product and ingredient data in your region. We’re continually expanding.",
    },
  ];
  return (
    <section id="faq">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-emerald-600 tracking-[0.2em] uppercase">
            FAQ
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-950">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm text-emerald-700">
            If you can’t find your answer here, you can always reach out to us
            through the contact section.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const open = activeFAQ === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-emerald-100 bg-white transition"
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
                  onClick={() =>
                    setActiveFAQ((prev) => (prev === index ? -1 : index))
                  }
                >
                  <span className="text-sm font-semibold text-emerald-900">
                    {faq.question}
                  </span>
                  <span className="ml-4 text-lg text-emerald-700">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <div className="p-6 text-xs text-emerald-700 border-t border-emerald-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQs;
