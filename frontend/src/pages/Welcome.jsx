import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiUser,
  FiShield,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiCpu,
} from "react-icons/fi";

export default function Welcome() {
  const { user, role, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span className="h-3 w-3 animate-pulse rounded-full bg-brand-500" />
          <span className="text-sm text-slate-600">
            Loading your dashboard…
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            You’re not signed in
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please log in again to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    user.displayName || user.email?.split("@")[0] || "there";

  const formattedLastLogin = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : "—";

  const effectiveRole = isAdmin ? "Admin" : role ? role : "User";

  // 🔹 Quick actions as an array
  const quickActions = [
    isAdmin && {
      to: "/dashboard/users",
      label: "Manage users",
      icon: FiUser,
      variant: "secondary",
    },
    isAdmin && {
      to: "/dashboard/products/ai",
      label: "Review AI products",
      icon: FiCpu,
      variant: "secondary",
    },
    !isAdmin && {
      to: "/dashboard/subscriptions",
      label: "View subscriptions",
      icon: FiActivity,
      variant: "primary",
    },
  ].filter(Boolean); // remove false entries when !isAdmin

  return (
    <div className="space-y-6">
      {/* Header / Greeting */}
      <section className="rounded-2xl border border-brand-100 bg-linear-to-r from-brand-50 via-white to-brand-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Welcome back
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Hi, {displayName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              This is your central dashboard for management. Use the navigation
              on the left to explore.
            </p>
          </div>

          <div className="mt-2 flex flex-col items-start gap-2 rounded-xl border border-brand-100 bg-white px-4 py-3 text-xs text-slate-700 shadow-sm md:mt-0">
            <div className="flex items-center gap-2">
              <FiUser className="text-brand-600" />
              <span className="font-semibold text-slate-900">
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiShield className="text-brand-600" />
              <span>
                Role:{" "}
                <span className="font-medium text-slate-900">
                  {effectiveRole}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-brand-600" />
              <span>Last login: {formattedLastLogin}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Account Status
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Active
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FiCheckCircle />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Your account is connected and ready to manage halal product data and
            subscriptions.
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Access Level
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {isAdmin ? "Full admin access" : "Standard user access"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <FiShield />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {isAdmin
              ? "You can manage users, products, and more."
              : "You can manage your own subscriptions and usage."}
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Activity
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                At a glance
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <FiActivity />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Use the sidebar to view scans, revenue, community votes, and
            subscriptions in more detail.
          </p>
        </div>
      </section>

      {/* Next actions */}
      <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              What would you like to do next?
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Use these quick shortcuts to jump straight into the most common
              actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ to, label, icon: Icon, variant }) => (
              <Link
                key={to}
                to={to}
                className={[
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  variant === "primary"
                    ? "border border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100"
                    : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100",
                ].join(" ")}
              >
                <Icon
                  className={
                    variant === "primary"
                      ? "text-brand-600"
                      : "text-slate-500"
                  }
                />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
