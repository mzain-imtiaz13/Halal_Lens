import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { logout, user } = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const navItems = [
    { label: "Plans", href: "/billing" },
    { label: "Features", href: "/#features" },
    { label: "Discover", href: "/#discover" },
    { label: "Reviews", href: "/#testimonials" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/support" },
    { label: "About", href: "/about" },
  ];
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleNavClick = () => {
    setMobileOpen(false);
  };
  return (
    <header className="sticky top-0 z-30 bg-emerald-50/90 backdrop-blur border-b border-emerald-100">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link className="flex items-center gap-2 cursor-pointer" to={"/"}>
          <div className="flex h-11 w-11 items-center justify-center">
            <img src="Halal_lens_logo.png" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-emerald-900">Halal Lens</span>
            <span className="text-xs text-emerald-600">
              Scan. Verify. Eat with confidence.
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-emerald-800 hover:text-emerald-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        {user ? (
          <div className="top-actions">
            <span className="user-email">{user?.email}</span>
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
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-emerald-700" />
            <span className="block h-0.5 w-5 bg-emerald-700" />
            <span className="block h-0.5 w-5 bg-emerald-700" />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-emerald-50">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-left text-sm text-emerald-800 hover:text-emerald-600"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
