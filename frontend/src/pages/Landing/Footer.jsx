import { Link } from "react-router-dom";

const handleNavClick = (href) => {
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const Footer = () => {
  return (
    <footer
      id="footer"
      className="bg-emerald-900 text-emerald-50 mt-8 md:mt-12"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold">
              حلال
            </div>
            <span className="font-semibold text-white text-base">
              Halal Lens
            </span>
          </div>
          <p className="text-xs text-emerald-100 max-w-md">
            Halal Lens helps you make confident food choices by combining
            barcode scanning, image upload, AI classification and community
            review in a single, simple app.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-100 mb-2">
            Product
          </h4>
          <ul className="space-y-1 text-xs text-emerald-100/80">
            <li>
              <a href="/#features" className="hover:text-white transition">
                Features
              </a>
            </li>
            <li>
              <a href="/#discover" className="hover:text-white transition">
                Screenshots
              </a>
            </li>
            <li>
              <a href="/#faq" className="hover:text-white transition">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-100 mb-2">
            Contact
          </h4>
          <ul>
            <li>
              <Link to="/support" className="text-xs text-emerald-100/80">
                Contact & Support
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-xs text-emerald-100/80">
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-emerald-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-emerald-200">
            © {new Date().getFullYear()} Halal Lens. All rights reserved.
          </p>
          <div className="flex gap-3 text-[11px] text-emerald-200">
            <button className="hover:text-white transition">
              Privacy Policy
            </button>
            <Link
              to={"/terms-of-service"}
              className="hover:text-white transition"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
