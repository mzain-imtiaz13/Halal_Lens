import { FaApple } from "react-icons/fa";
import { FaGooglePlay } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        {/* Hero copy */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Halal product checker for everyday life
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-950 leading-tight">
            Halal at your <span className="text-green-600">fingertips</span>.
          </h1>
          <p className="text-sm md:text-base text-green-700 max-w-xl">
            With Halal Lens, you can scan barcodes, upload product images, or
            scan QR codes to instantly see if your food is Halal, Haram, or
            Suspicious—ingredient by ingredient.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={import.meta.env.VITE_APP_STORE_URL} className="text-white flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs md:text-sm font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition">
              <span className="text-xl text-white">
                <FaApple />{" "}
              </span>
              <span className="flex flex-col leading-tight text-white">
                <span className="text-[10px] uppercase tracking-wide">
                  Download on the
                </span>
                <span>App Store</span>
              </span>
            </a>
            <a href={import.meta.env.VITE_GOOGLE_PLAY_URL} className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-xs md:text-sm font-semibold text-green-800 border border-green-200 hover:bg-green-200/70 hover:-translate-y-0.5 hover:shadow-md transition">
              <span className="text-xl">
                <FaGooglePlay />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wide">
                  Get it on
                </span>
                <span>Google Play</span>
              </span>
            </a>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-green-700">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Barcode & QR scan
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Image upload support
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Community voting
            </div>
          </div>
        </div>

        {/* Hero phone mockup */}
        <div className="flex justify-center md:justify-end p-6">
          <div className="relative">
            <div className="absolute z-10 -top-6 -left-6 rounded-3xl bg-green-100 px-3 py-2 text-xs text-green-800 shadow-sm">
              <span className="font-semibold">Real-time verdicts</span>
              <span className="ml-1">✅</span>
            </div>
            <div className="relative h-[440px] w-[230px] rounded-4xl border border-green-100 bg-white shadow-xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-transform duration-300">
              <img src="4.png"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
