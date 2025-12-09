import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button";

const Navbar = ({ navItems }) => {
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const handleCloseMobile = () => setMobileOpen(false);

  // ---------------------------
  // ACTIVE LINK DETECTION LOGIC
  // ---------------------------
  const isActive = (item) => {
    const currentPath = location.pathname + location.hash;

    if (item.type === "route") {
      return location.pathname === item.href;
    }

    if (item.type === "anchor") {
      return (
        currentPath === item.href ||
        location.hash === item.href.replace("/", "")
      );
    }

    return false;
  };

  const getClasses = (item) => {
    const base = "px-3 py-1 rounded-full transition-colors text-sm";
    const active = "text-brand-800 bg-brand-200 shadow-md font-semibold";
    const inactive = "text-brand-800 hover:text-brand-600 hover:bg-brand-100";

    return base + " " + (isActive(item) ? active : inactive);
  };

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

  const userEmailLabel = user?.email || "Account";

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-brand-50/90 backdrop-blur">
      <div className="mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link className="flex cursor-pointer items-center gap-2" to="/">
          <div className="flex h-11 w-11 items-center justify-center">
            <img src="/Halal_lens_logo.png" alt="logo" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-brand-900">Halal Lens</span>
            <span className="text-xs text-brand-600">
              Scan. Verify. Eat with confidence.
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-3 md:flex">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Right side: auth / profile */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              {/* Avatar / trigger */}
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-900 shadow-sm hover:bg-brand-50 cursor-pointer"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                  {userEmailLabel.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-40 truncate text-xs text-brand-900 sm:inline">
                  {userEmailLabel}
                </span>
                <svg
                  className="h-3 w-3 text-brand-700"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-brand-100 bg-white py-2 text-sm shadow-lg">
                  <div className="border-b border-brand-50 px-3 pb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                      Signed in as
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-brand-900">
                      {userEmailLabel}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/dashboard/welcome");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-brand-50 cursor-pointer"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                    <span>Go to dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="primary">
              <Link to="/login">Log in</Link>
            </Button>
          )}

          {/* Mobile Toggle */}
          <button
            className="inline-flex items-center justify-center rounded-full border border-brand-200 p-2 text-brand-700 md:hidden cursor-pointer"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <div className="space-y-1">
              <span className="block h-0.5 w-5 bg-brand-700" />
              <span className="block h-0.5 w-5 bg-brand-700" />
              <span className="block h-0.5 w-5 bg-brand-700" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown nav */}
      {mobileOpen && (
        <div className="border-t border-brand-100 bg-brand-50 md:hidden">
          <div className="flex flex-col gap-2 px-4 py-3">
            {navItems.map((item) => renderNavItem(item))}

            {user && (
              <>
                <div className="mt-2 border-t border-brand-100 pt-2 text-[11px] text-brand-700">
                  Signed in as {userEmailLabel}
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/dashboard/welcome");
                  }}
                  className="w-full rounded-full border border-brand-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand-900 cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={async () => {
                    setMobileOpen(false);
                    await handleLogout();
                  }}
                  className="w-full rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-left text-xs font-medium text-red-700 cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
