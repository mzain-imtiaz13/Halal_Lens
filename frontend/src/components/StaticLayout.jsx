import { Outlet } from "react-router-dom";
import Footer from "../pages/Landing/Footer";
import Navbar from "../pages/Landing/Navbar";

const StaticLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 text-emerald-950">
      <Navbar
        navItems={[
          { label: "Plans", href: "/billing", type: "route" },
          { label: "Features", href: "/#features", type: "anchor" },
          { label: "Discover", href: "/#discover", type: "anchor" },
          { label: "Reviews", href: "/#testimonials", type: "anchor" },
          { label: "FAQ", href: "/#faq", type: "anchor" },
          { label: "Contact", href: "/support", type: "route" },
          { label: "About", href: "/about", type: "route" },
        ]}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StaticLayout;
