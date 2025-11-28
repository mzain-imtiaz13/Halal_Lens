import { FaApple } from "react-icons/fa";
import { FaGooglePlay } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        {/* Hero copy */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Halal product checker for everyday life
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-950 leading-tight">
            Halal at your <span className="text-emerald-600">fingertips</span>.
          </h1>
          <p className="text-sm md:text-base text-emerald-700 max-w-xl">
            With Halal Lens, you can scan barcodes, upload product images, or
            scan QR codes to instantly see if your food is Halal, Haram, or
            Suspicious—ingredient by ingredient.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition">
              <span className="text-xl">
                <FaApple />{" "}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wide">
                  Download on the
                </span>
                <span>App Store</span>
              </span>
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-xs md:text-sm font-semibold text-emerald-800 border border-emerald-200 hover:bg-emerald-200/70 hover:-translate-y-0.5 hover:shadow-md transition">
              <span className="text-xl">
                <FaGooglePlay />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wide">
                  Get it on
                </span>
                <span>Google Play</span>
              </span>
            </button>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-emerald-700">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Barcode & QR scan
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Image upload support
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Community voting
            </div>
          </div>
        </div>

        {/* Hero phone mockup */}
        <div className="flex justify-center md:justify-end">
          <div className="relative">
            <div className="absolute z-10 -top-6 -left-6 rounded-3xl bg-emerald-100 px-3 py-2 text-xs text-emerald-800 shadow-sm">
              <span className="font-semibold">Real-time verdicts</span>
              <span className="ml-1">✅</span>
            </div>
            <div className="relative h-[440px] w-[230px] rounded-4xl border border-emerald-100 bg-white shadow-xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-transform duration-300">
              <img src="4.png"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
