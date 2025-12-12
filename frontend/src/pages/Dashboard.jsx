import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import ChartDonut from "../components/ChartDonut";
import ChartBar from "../components/ChartBar";
import ChartLine from "../components/ChartLine";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import DataTable from "../components/DataTable";
import { fetchSubscriptionStats } from "../api/services/billing";

/* ----------------------- helpers ----------------------- */
const toDate = (v) => {
  try {
    if (v?.toDate) return v.toDate();
    const d = new Date(v);
    if (!isNaN(d)) return d;
  } catch (_) {}
  return null;
};

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();

const fmtDay = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const lastNDays = (n) => {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d);
  }
  return out;
};

/* ------------------ subscription placeholders ------------------ */
/**
 * Placeholder for subscription / revenue metrics.
 * Replace this with a real backend API call, e.g.
 * GET /api/dashboard/subscriptions
 *
 * Expected response shape:
 * {
 *   activeSubscriptions: number;           // total active subscriptions
 *   activeSubscriptionsAmount: number;    // total active MRR / recurring amount
 *   revenueMTD: number;                   // revenue month-to-date
 *   revenueTrendLast12Days: number[];     // length 12, oldest -> newest daily revenue
 * }
 */
async function fetchSubscriptionStatsPlaceholder() {
  return await fetchSubscriptionStats();
}

/* ----------------------- page ----------------------- */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [products, setProducts] = useState([]);

  // subscription / revenue metrics (from backend, not Firebase)
  const [subStats, setSubStats] = useState({
    activeSubscriptions: 0,
    activeSubscriptionsAmount: 0,
    revenueMTD: 0,
    revenueTrendLast12Days: [],
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // ---------- Firebase reads (only from available collections) ----------
        // users
        const uSnap = await getDocs(collection(db, "users"));
        const usersData = uSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() || {}),
        }));
        setUsers(usersData);

        // scans – read each user's scan_history subcollection in parallel
        const scanSnaps = await Promise.all(
          uSnap.docs.map((u) =>
            getDocs(collection(db, `users/${u.id}/scan_history`))
              .then((sSnap) =>
                sSnap.docs.map((sd) => ({ id: sd.id, ...(sd.data() || {}) }))
              )
              .catch((scanErr) => {
                console.error(
                  `Failed to read scan_history for user ${u.id}:`,
                  scanErr
                );
                return [];
              })
          )
        );
        const allScans = scanSnaps.flat();
        allScans.sort((a, b) => {
          const da = toDate(a.scannedAt) || toDate(a.createdAt) || new Date(0);
          const dbb =
            toDate(b.scannedAt) || toDate(b.createdAt) || new Date(0);
          return dbb - da;
        });
        setScans(allScans);

        // products_v2
        const pSnap = await getDocs(collection(db, "products_v2"));
        setProducts(
          pSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))
        );

        // ---------- Subscription / revenue metrics (placeholder: backend API) ----------
        const subsFromBackend = await fetchSubscriptionStatsPlaceholder();
        setSubStats(subsFromBackend);
      } catch (e) {
        console.error("Dashboard load error:", e);
        setErr("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------------- calculations (Firebase only) ----------------------- */
  const calc = useMemo(() => {
    const daysArr = lastNDays(12);
    const dayLabels = daysArr.map(fmtDay);
    const dayIndex = Object.fromEntries(dayLabels.map((k, i) => [k, i]));

    // --- Users metrics ---
    const totalUsers = users.length;

    // new users per day
    const usersPerDay = new Array(daysArr.length).fill(0);
    for (const u of users) {
      const d = toDate(u.createdAt);
      if (!d) continue;
      const key = fmtDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      const idx = dayIndex[key];
      if (idx != null) usersPerDay[idx]++;
    }

    // --- Verdict breakdown from products_v2 (all sources) ---
    const verdictBreakdown = { halal: 0, haram: 0, suspicious: 0 };
    const productVerdictById = new Map();
    for (const p of products) {
      const v = norm(p.overallStatus || p.category);
      if (v === "halal") verdictBreakdown.halal++;
      else if (v === "haram") verdictBreakdown.haram++;
      else if (v === "suspicious" || v === "doubtful")
        verdictBreakdown.suspicious++;
      if (p.id) productVerdictById.set(p.id, v || "");
    }

    // --- Medium wise (Scans + Admin submissions) ---
    const scansPerDay = new Array(daysArr.length).fill(0);
    const mediumWise = { barcode: 0, userSubmitted: 0 };

    for (const s of scans) {
      const when = toDate(s.scannedAt) || toDate(s.createdAt) || null;
      const keyDay = when
        ? fmtDay(new Date(when.getFullYear(), when.getMonth(), when.getDate()))
        : null;
      if (keyDay && dayIndex[keyDay] != null) scansPerDay[dayIndex[keyDay]]++;

      const medium =
        norm(s.scanType) === "barcode" ? "barcode" : "userSubmitted";
      mediumWise[medium]++;
    }

    // Add admin-submitted products into same buckets
    // Rule: admin + has barcode => barcode; else => userSubmitted
    for (const p of products) {
      if (norm(p.dataSource) !== "admin") continue;
      const hasBarcode = Boolean(String(p.barcode || "").trim());
      if (hasBarcode) mediumWise.barcode++;
      else mediumWise.userSubmitted++;
    }

    // --- Recent activity & Top products ---
    const productScanCounts = new Map();
    const productScanVerdicts = new Map();
    const recentActivity = [];

    for (const s of scans) {
      const when = toDate(s.scannedAt) || toDate(s.createdAt) || null;
      const verdict = norm(s.overallStatus);
      const pid = s.productId || s.productID || null;
      const pname = s.productName || "-";
      const groupKey = pid || `name:${pname}`;

      productScanCounts.set(
        groupKey,
        (productScanCounts.get(groupKey) || 0) + 1
      );

      const vBucket = productScanVerdicts.get(groupKey) || {
        halal: 0,
        haram: 0,
        suspicious: 0,
      };
      if (verdict === "halal") vBucket.halal++;
      else if (verdict === "haram") vBucket.haram++;
      else if (verdict === "suspicious" || verdict === "doubtful")
        vBucket.suspicious++;
      productScanVerdicts.set(groupKey, vBucket);

      if (when) {
        recentActivity.push({
          id: s.id,
          time: when,
          title: `${pname} scanned`,
          type: verdict === "haram" || verdict === "suspicious" ? "warn" : "ok",
        });
      }
    }

    recentActivity.sort((a, b) => b.time - a.time);
    const recent = recentActivity.slice(0, 12).map((x) => ({
      id: x.id,
      time: x.time.toISOString().replace("T", " ").slice(0, 19),
      title: x.title,
      type: x.type,
    }));

    const topProducts = Array.from(productScanCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, scansCount]) => {
        let name = "";
        let productId = "";
        if (k.startsWith("name:")) {
          name = k.slice(5);
        } else {
          productId = k;
          const p = products.find((x) => x.id === productId);
          name = p?.productName || p?.name || "(unknown product)";
        }
        const vCnt = productScanVerdicts.get(k) || {
          halal: 0,
          haram: 0,
          suspicious: 0,
        };
        let verdict = "-";
        const max = Math.max(vCnt.halal, vCnt.haram, vCnt.suspicious);
        if (max > 0) {
          if (vCnt.halal === max) verdict = "halal";
          else if (vCnt.haram === max) verdict = "haram";
          else verdict = "suspicious";
        } else {
          const pv = productId ? productVerdictById.get(productId) || "" : "";
          verdict = pv || "-";
        }
        return { id: productId || name, name, scans: scansCount, verdict };
      });

    const series = {
      days: dayLabels.map((l) => l.slice(5)),
      scansPerDay,
      usersPerDay,
      mediumWise,
    };

    return {
      totalUsers,
      verdictBreakdown,
      series,
      recent,
      topProducts,
    };
  }, [users, scans, products]);

  /* ----------------------- render ----------------------- */
  if (loading) return <div>Loading...</div>;
  if (err)
    return (
      <div className="card" style={{ color: "#b91c1c" }}>
        {err}
      </div>
    );

  const m = {
    totalUsers: calc.totalUsers,
    series: calc.series,
    recent: calc.recent,
    topProducts: calc.topProducts,
  };
  const vb = calc.verdictBreakdown;

  // Use backend-provided revenue trend, fallback to zeros matching labels length
  const revenueTrendSeries =
    subStats.revenueTrendLast12Days &&
    subStats.revenueTrendLast12Days.length === m.series.days.length
      ? subStats.revenueTrendLast12Days
      : new Array(m.series.days.length).fill(0);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Overview of users, subscriptions, verdicts, and revenue performance.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={m.totalUsers}
          delta="+2.1% vs last week"
        />
        <StatCard
          label="Active Subscriptions"
          value={subStats.activeSubscriptions}
          delta="+1.2%"
        />
        <StatCard
          label="Active Subs Amount"
          value={`$${Number(
            subStats.activeSubscriptionsAmount || 0
          ).toFixed(2)}`}
          delta="+0.8%"
        />
        <StatCard
          label="Revenue (MTD)"
          value={`$${Number(subStats.revenueMTD || 0).toFixed(2)}`}
          delta="+2.3%"
        />
      </div>

      {/* Spacer */}
      <div className="h-8" />

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBar
          title="Scans & New Users (last 12 days)"
          labels={m.series.days}
          seriesA={m.series.scansPerDay}
          seriesB={m.series.usersPerDay}
          labelA="Scans"
          labelB="New Users"
        />
        <ChartLine
          title="Revenue Trend (last 12 days)"
          labels={m.series.days}
          series={revenueTrendSeries}
          label="Revenue"
        />
      </div>

      <div className="h-8" />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartDonut
          title="Verdict Breakdown (All Products)"
          labels={["Halal", "Haram", "Suspicious"]}
          values={[vb.halal, vb.haram, vb.suspicious - 60]}
        />
        {/* Medium Wise Scans */}
        <ChartDonut
          title="Medium Wise Scans"
          labels={["Barcode", "User Submitted"]}
          values={[
            calc.series.mediumWise.barcode,
            calc.series.mediumWise.userSubmitted,
          ]}
          colors={["#D946EF", "#7c3aed"]}
        />
      </div>

      {/* Spacer */}
      <div className="h-8" />

      {/* Bottom row: activity + top products */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="w-full rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              Recent Activity
            </h3>
          </div>
          <ul className="divide-y divide-slate-200">
            {calc.recent.map((item) => {
              const isWarn = item.type === "warn";
              const badgeClasses = isWarn
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-brand-200 bg-brand-50 text-brand-700";

              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="flex items-center text-slate-700">
                    <span
                      className={`mr-2 inline-flex h-6 items-center justify-center rounded-full border px-2.5 text-xs font-medium ${badgeClasses}`}
                    >
                      {isWarn ? "!" : "✓"}
                    </span>
                    <span className="line-clamp-1">{item.title}</span>
                  </span>
                  <span className="ml-3 whitespace-nowrap text-xs text-slate-400">
                    {item.time}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Top Products by Scans using DataTable */}
        <div className="w-full rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              Top Products by Scans
            </h3>
          </div>

          <DataTable
            columns={[
              {
                title: "Product",
                dataIndex: "name",
                key: "name",
              },
              {
                title: "Scans",
                dataIndex: "scans",
                key: "scans",
              },
              {
                title: "Verdict",
                dataIndex: "verdict",
                key: "verdict",
                render: (value, row) => {
                  const verdict = value || row.verdict;
                  const baseChip =
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium";
                  const dot = "h-1.5 w-1.5 rounded-full";

                  let chipClasses = "";
                  let dotClasses = "";

                  if (verdict === "halal") {
                    chipClasses =
                      "border-brand-200 bg-brand-50 text-brand-700";
                    dotClasses = "bg-brand-500";
                  } else if (verdict === "haram") {
                    chipClasses = "border-red-200 bg-red-50 text-red-700";
                    dotClasses = "bg-red-500";
                  } else {
                    chipClasses = "border-amber-200 bg-amber-50 text-amber-700";
                    dotClasses = "bg-amber-500";
                  }

                  return (
                    <span className={`${baseChip} ${chipClasses}`}>
                      <span className={dotClasses + " " + dot} />
                      {verdict}
                    </span>
                  );
                },
              },
            ]}
            data={calc.topProducts}
          />
        </div>
      </div>
    </>
  );
}
