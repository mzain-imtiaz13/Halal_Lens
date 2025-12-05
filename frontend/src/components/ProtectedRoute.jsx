import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  // Not authenticated → go to login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated but role not allowed → go to unauthorized
  if (roles && roles.length > 0 && !roles.includes(role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location }}
      />
    );
  }

  // Auth OK (and role OK if required) → render nested routes
  return <Outlet />;
}
