const Discover = () => {
  const screenshots = [
    {
      title: "Discover",
      description: "Login and start a scan or upload in one tap.",
      src: "1.png",
    },
    {
      title: "Product Verdict",
      description:
        "Clear Halal, Haram, or Suspicious status with ingredient tags.",
      src: "2.png",
    },
    {
      title: "Check via Photo",
      description: "See the status of product by uploading it's photos.",
      src: "3.png",
    },
  ];

  return (
    <section id="discover">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">
            Discover
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-brand-950">
            A quick look inside the Halal Lens app
          </h2>
          <p className="mt-3 text-sm text-brand-700 max-w-2xl mx-auto">
            Use your camera, browse results, and join the community that helps
            validate suspicious ingredients.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {screenshots.map((shot) => (
            <div
              key={shot.title}
              className="rounded-3xl bg-white border border-brand-100 flex flex-col items-center shadow-sm hover:-translate-y-1 hover:shadow-xl transition-transform duration-300"
            >
              <div className="relative mb-2 w-full overflow-hidden rounded-2xl bg-brand-50 aspect-auto">
                <img src={shot.src} />
              </div>
              <h3 className="text-sm font-semibold text-brand-900 text-center">
                {shot.title}
              </h3>
              <p className="text-xs text-brand-700 text-center p-4">
                {shot.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Discover;
