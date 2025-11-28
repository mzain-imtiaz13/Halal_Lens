const HowItWorks = () => {
  const workflowSteps = [
    {
      title: "Scan or Upload",
      description:
        "Login, scan the barcode with your camera, or upload a product image / QR code.",
    },
    {
      title: "Check Our Database",
      description:
        "If we’ve seen the product before, Halal Lens returns the saved verdict immediately.",
    },
    {
      title: "Automatic Classification",
      description:
        "If it’s new, we fetch details from Open Food Facts and classify ingredients using AI.",
    },
    {
      title: "Handle Suspicious Items",
      description:
        "Suspicious ingredients trigger a community poll and are flagged clearly in the app.",
    },
    {
      title: "Admin Review",
      description:
        "Admins see logs, votes, and can override the final ruling from the web dashboard.",
    },
  ];
  return (
    <section id="workflow" className="bg-white border-t border-emerald-100">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-semibold text-emerald-600 tracking-[0.2em] uppercase">
              How It Works
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-950">
              From scan to verdict in a few seconds
            </h2>
            <p className="mt-3 text-sm text-emerald-700">
              Halal Lens connects the mobile app, backend, and admin web panel
              in a single workflow powered by Django, PostgreSQL, and AWS.
            </p>

            <div className="mt-6 space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3 items-start">
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      {step.title}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900 mb-3">
              Tech stack overview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-emerald-800">
              <div className="space-y-2">
                <p className="font-semibold text-emerald-900">Frontend</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>React Native mobile app</li>
                  <li>React / Next.js admin panel</li>
                  <li>Tailwind CSS UI</li>
                  <li>Barcode & QR scan</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-emerald-900">Backend</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Django REST Framework</li>
                  <li>PostgreSQL + Redis cache</li>
                  <li>JWT authentication</li>
                  <li>Open Food Facts API</li>
                  <li>OpenAI for classification</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-emerald-900">Infrastructure</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Dockerized services</li>
                  <li>AWS EC2 / Elastic Beanstalk</li>
                  <li>AWS S3 for product images</li>
                  <li>AWS CloudWatch / Sentry</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-emerald-900">Admin Tools</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>User & product management</li>
                  <li>Override AI verdicts</li>
                  <li>Poll results & logs</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-emerald-700">
              This architecture keeps Halal Lens fast, scalable, and ready for
              production workloads.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
