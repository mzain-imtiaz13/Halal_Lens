const Features = () => {
  const features = [
    {
      title: "Smart Halal Product Scan",
      description:
        "Scan barcodes or QR codes to instantly check if a product is Halal, Haram, or Suspicious.",
      icon: "📷",
    },
    {
      title: "Image Upload Checker",
      description:
        "No barcode? Just snap or upload a clear photo of the product and ingredients to get a verdict.",
      icon: "🖼️",
    },
    {
      title: "Ingredient-Level Analysis",
      description:
        "Each ingredient is checked and tagged using AI and global food data sources.",
      icon: "🧬",
    },
    {
      title: "Community Voting",
      description:
        "If an ingredient is suspicious, the community can vote Halal, Haram, or Unsure.",
      icon: "👥",
    },
    {
      title: "Admin Control Panel",
      description:
        "Dedicated web dashboard to review classifications, votes, and override decisions when needed.",
      icon: "🛠️",
    },
    {
      title: "Built for Performance",
      description:
        "Deployed on AWS with caching so repeat scans feel instant, even on slow connections.",
      icon: "⚡",
    },
  ];
  return (
    <section id="features">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-green-600 tracking-[0.2em] uppercase">
            Features
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-green-950">
            Built for Muslims who read labels seriously
          </h2>
          <p className="mt-3 text-sm text-green-700 max-w-2xl mx-auto">
            Halal Lens connects mobile scanning, AI classification, and a
            powerful admin dashboard to give you trusted guidance in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-green-100 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:bg-green-50 transition duration-300"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-xl">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-green-700 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
