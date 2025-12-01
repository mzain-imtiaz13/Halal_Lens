// src/layout/Layout.jsx (or wherever this lives)
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../pages/Landing/Navbar";
import Sidebar from "../components/Sidebar"; // adjust path if needed

export default function Layout() {
  // Collapsible sidebar (persist)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("hl__sidebar") === "collapsed";
    } catch (_) {
      return false;
    }
  });

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("hl__sidebar", next ? "collapsed" : "expanded");
    } catch (_) {}
  };

  return (
    <div className={`flex flex-col ${collapsed ? "collapsed" : ""}`}>
      <Navbar
        navItems={[]}
      />
      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <div className="container flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
