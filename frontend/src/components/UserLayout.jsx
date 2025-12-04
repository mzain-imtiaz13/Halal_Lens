import { Outlet } from "react-router-dom";
import Footer from "../pages/Landing/Footer";
import Navbar from "../pages/Landing/Navbar";

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 text-emerald-950">
      <Navbar
        navItems={[
          { label: "Plans", href: "/billing", type: "route" },
          { label: "Your Subscriptions", href: "/dashboard/subscriptions", type: "route" },
        ]}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
