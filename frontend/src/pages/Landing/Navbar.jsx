import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = ({ navItems }) => {
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation(); // detect current URL

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleCloseMobile = () => setMobileOpen(false);

  // ---------------------------
  // ACTIVE LINK DETECTION LOGIC
  // ---------------------------
  const isActive = (item) => {
    const currentPath = location.pathname + location.hash;

    // Case: route like "/billing" or "/about"
    if (item.type === "route") {
      return location.pathname === item.href;
    }

    // Case: anchor like "/#faq" or "#faq"
    if (item.type === "anchor") {
      return currentPath === item.href || location.hash === item.href.replace("/", "");
    }

    return false;
  };

  // STYLE FOR ACTIVE NAV ITEM
  const getClasses = (item) => {
    const base =
      "px-3 py-1 rounded-full transition-colors text-sm";

    const active =
      "bg-emerald-200 text-white shadow-md font-semibold";

    const inactive =
      "text-emerald-800 hover:text-emerald-600 hover:bg-emerald-100";

    return base + " " + (isActive(item) ? active : inactive);
  };

  // ---------------------------
  // RENDER NAV ITEM (Link or <a>)
  // ---------------------------
  const renderNavItem = (item) => {
    if (item.type === "route") {
      return (
        <Link
          key={item.href}
          to={item.href}
          onClick={handleCloseMobile}
          className={getClasses(item)}
        >
          {item.label}
        </Link>
      );
    }

    // Anchor link
    return (
      <a
        key={item.href}
        href={item.href}
        onClick={handleCloseMobile}
        className={getClasses(item)}
      >
        {item.label}
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-50/90 backdrop-blur border-b border-emerald-100">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link className="flex items-center gap-2 cursor-pointer" to="/">
          <div className="flex h-11 w-11 items-center justify-center">
            <img src="Halal_lens_logo.png" alt="logo" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-emerald-900">Halal Lens</span>
            <span className="text-xs text-emerald-600">
              Scan. Verify. Eat with confidence.
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Auth buttons */}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs">{user?.email}</span>
            <button className="btn primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn primary">
            Log in
          </Link>
        )}

        {/* Mobile Toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-full border border-emerald-200 p-2 text-emerald-700"
          onClick={() => setMobileOpen((s) => !s)}
        >
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-emerald-700" />
            <span className="block h-0.5 w-5 bg-emerald-700" />
            <span className="block h-0.5 w-5 bg-emerald-700" />
          </div>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-emerald-50">
          <div className="px-4 py-3 flex flex-col gap-2">
            {navItems.map((item) => renderNavItem(item))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
