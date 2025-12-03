const values = [
  {
    title: "Transparency",
    description:
      "We clearly display ingredient details, sources, and reasons behind each Halal, Haram, or Suspicious verdict.",
  },
  {
    title: "Quality",
    description:
      "From data sources to infrastructure, we prioritize accuracy, reliability, and performance in every part of the system.",
  },
  {
    title: "Community",
    description:
      "We believe the Muslim community is our strongest asset—polls, feedback, and suggestions directly shape the app.",
  },
  {
    title: "Innovation",
    description:
      "We combine modern technology with classical guidance to solve everyday halal verification problems in smarter ways.",
  },
  {
    title: "Integrity",
    description:
      "We follow ethical, professional, and Shariah-aligned practices in how we build, decide, and communicate.",
  },
  {
    title: "Accessibility",
    description:
      "Halal Lens is designed to be simple, multilingual-ready, and usable for all ages, wherever they are.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen text-emerald-950 flex flex-col">
      <main className="flex-1">
        {/* Hero / Intro */}
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 lg:py-20 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold text-emerald-600 tracking-[0.2em] uppercase">
                About Halal Lens
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-950 leading-tight">
                Helping you see{" "}
                <span className="text-emerald-600">clarity in every label</span>
              </h1>
              <p className="text-sm md:text-base text-emerald-700 max-w-xl">
                Halal Lens was created to make it easier for Muslims to verify
                what they eat—whether they are at home, traveling, or living in
                countries where halal options aren’t always obvious. By blending
                trusted guidance with modern technology, we turn barcode scans
                and product photos into clear halal decisions.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative max-w-sm w-full">
                <div className="absolute -top-7 rounded-3xl bg-white/80 px-4 py-3 shadow-md text-xs text-emerald-800">
                  <p className="font-semibold">Our Vision</p>
                  <p className="text-[11px]">
                    A world where every Muslim can check any product, anywhere,
                    in seconds.
                  </p>
                </div>
                <div className="absolute -bottom-10 rounded-2xl bg-emerald-600 px-3 py-2 text-[11px] text-emerald-50 shadow-lg">
                  1M+ potential products covered via Open Food Facts & growing
                  crowdsourced data.
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-white shadow-xl p-6 mt-6 hover:-translate-y-1 hover:shadow-2xl transition">
                  <p className="text-xs font-semibold text-emerald-900 mb-3">
                    Why we exist
                  </p>
                  <p className="text-xs text-emerald-700 mb-3">
                    Long ingredient lists, unfamiliar terms, and foreign
                    languages can make halal decisions stressful. Halal Lens
                    simplifies this with:
                  </p>
                  <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
                    <li>Instant scanning and photo upload options</li>
                    <li>Ingredient-level halal, haram, and suspicious tags</li>
                    <li>Community voting on doubtful items</li>
                    <li>Shariah advisors overseeing our decision rules</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Story */}
        <section className="border-y border-emerald-100">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-emerald-950 mb-3">
                Our Mission
              </h2>
              <p className="text-sm text-emerald-700 mb-3">
                Our mission is to make halal awareness practical and
                actionable—especially for Muslims living in non-Muslim majority
                countries. Halal Lens offers a simple way to:
              </p>
              <ul className="list-disc list-inside text-sm text-emerald-800 space-y-1">
                <li>Identify halal-friendly products with a quick scan.</li>
                <li>
                  Understand exactly which ingredients may be doubtful or
                  problematic.
                </li>
                <li>
                  Participate in community-driven votes when something is not
                  clearly halal or haram.
                </li>
                <li>
                  Rely on a workflow that combines authentic guidance and
                  transparent technology.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-emerald-950 mb-3">
                Our Story
              </h2>
              <p className="text-sm text-emerald-700 mb-3">
                Halal Lens started when a small team of developers and students
                abroad realized how often they were standing in supermarket
                aisles, searching ingredient names online and still feeling
                unsure. Different countries, different labels, same question:
                “Is this actually halal?”
              </p>
              <p className="text-sm text-emerald-700 mb-3">
                We began by experimenting with barcode scanning, open food
                databases, and AI classification. With feedback from scholars
                and halal-conscious families, the idea grew into a complete
                workflow—mobile app for scanning, backend for classification,
                and an admin panel to manage rulings and community polls.
              </p>
              <p className="text-sm text-emerald-700">
                Today, Halal Lens is being shaped with one goal in mind: helping
                Muslims feel confident about the products they buy, without
                needing to be a chemistry expert every time they visit a store.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-emerald-900 text-emerald-50">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-200 mb-2">
                Our Founder
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Prince Faisal – vision behind Halal Lens
              </h2>
              <p className="text-sm text-emerald-100 mb-3">
                Halal Lens is guided by the vision of{" "}
                <span className="font-semibold">Prince Faisal</span>, who
                believes that access to trustworthy halal information should be
                effortless for every Muslim, regardless of where they live.
              </p>
              <p className="text-sm text-emerald-100 mb-3">
                With a passion for technology and community welfare, Prince
                Faisal championed the idea of combining barcode and QR scanning,
                open data, and AI-powered ingredient analysis into one simple
                mobile experience. His focus has always been clarity,
                transparency, and ease-of-use—so families can shop with
                confidence instead of confusion.
              </p>
              <p className="text-sm text-emerald-100">
                Under his leadership, Halal Lens aims to grow into a trusted
                global companion for halal-conscious users, partnering with
                scholars, certification bodies, and brands that share the same
                commitment to integrity and authenticity.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="rounded-3xl bg-emerald-800/70 border border-emerald-600 p-6 shadow-xl max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/prince-faisal.jfif" className="h-12 w-12 rounded-full bg-emerald-700 flex items-center justify-center text-lg font-semibold"/>                   
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Prince Faisal
                    </p>
                    <p className="text-[11px] text-emerald-200">
                      Founder & Patron of Halal Lens
                    </p>
                  </div>
                </div>
                <p className="text-xs text-emerald-100 mb-3">
                  “Technology should make it easier to follow our principles,
                  not harder. Halal Lens is my attempt to give the Ummah a tool
                  that turns everyday shopping into a source of peace of mind.”
                </p>
                <div className="mt-4 text-[11px] text-emerald-200">
                  <p>Key focus areas:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Supporting Muslims in minority communities</li>
                    <li>
                      Encouraging transparent, evidence-based halal rulings
                    </li>
                    <li>
                      Building bridges with scholars and certification bodies
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Values */}
        <section className="bg-emerald-50">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-emerald-600 tracking-[0.2em] uppercase">
                Our Values
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-950">
                Principles that guide every decision
              </h2>
              <p className="mt-3 text-sm text-emerald-700 max-w-2xl mx-auto">
                These values influence how we design features, choose data
                sources, speak to the community, and grow the platform.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="group rounded-2xl bg-white border border-emerald-100 p-5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:bg-emerald-50 transition duration-300"
                >
                  <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                    {v.title}
                  </h3>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    {v.description}
                  </p>
                  <div className="mt-3 h-0.5 w-10 bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-500 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
