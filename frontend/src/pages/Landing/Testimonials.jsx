const Testimonials = () => {
      const testimonials = [
    {
      name: "Ahmed R.",
      role: "Student in Tokyo",
      quote:
        "Halal Lens removes the guesswork from grocery shopping. I just scan and know if it’s safe to buy.",
    },
    {
      name: "Fatima K.",
      role: "Working Mother",
      quote:
        "The image upload feature is a lifesaver when there is no barcode. It’s fast and easy to understand.",
    },
    {
      name: "Yusuf M.",
      role: "Traveler",
      quote:
        "Whenever I visit a new city, Halal Lens helps me stay confident about what I’m eating.",
    },
  ];
  return (
    <section
      id="testimonials"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-emerald-600 tracking-[0.2em] uppercase">
            Reviews
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-950">
            Trusted by Muslims who care about what they eat
          </h2>
          <p className="mt-3 text-sm text-emerald-700 max-w-2xl mx-auto">
            Here’s what early users say about the Halal Lens experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl bg-white border border-emerald-100 p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <figcaption className="text-sm font-semibold text-emerald-900">
                    {t.name}
                  </figcaption>
                  <p className="text-[11px] text-emerald-600">{t.role}</p>
                </div>
              </div>
              <blockquote className="text-xs leading-relaxed text-emerald-800">
                “{t.quote}”
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
