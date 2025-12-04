import { Outlet } from "react-router-dom";
import Navbar from "../pages/Landing/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { sidebarLinks, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navItems={[]} />

      <div className="flex flex-1 min-h-0">
        {/* While loading, pass an empty array */}
        <Sidebar links={loading ? [] : sidebarLinks} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="mx-auto max-w-6xl p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
