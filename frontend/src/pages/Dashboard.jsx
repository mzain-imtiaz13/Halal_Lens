import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import ChartDonut from "../components/ChartDonut";
import ChartBar from "../components/ChartBar";
import ChartLine from "../components/ChartLine";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import './../styles.css'
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
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

/* ----------------------- page ----------------------- */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // users
        const uSnap = await getDocs(collection(db, "users"));
        const usersData = uSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() || {}),
        }));
        setUsers(usersData);

        // scans – walk each user's scan_history subcollection
        const allScans = [];
        for (const u of uSnap.docs) {
          try {
            const sSnap = await getDocs(
              collection(db, `users/${u.id}/scan_history`)
            );
            sSnap.docs.forEach((sd) =>
              allScans.push({ id: sd.id, ...(sd.data() || {}) })
            );
          } catch (scanErr) {
            console.error(
              `Failed to read scan_history for user ${u.id}:`,
              scanErr
            );
          }
        }
        allScans.sort((a, b) => {
          const da = toDate(a.scannedAt) || toDate(a.createdAt) || new Date(0);
          const dbb = toDate(b.scannedAt) || toDate(b.createdAt) || new Date(0);
          return dbb - da;
        });
        setScans(allScans);

        // products
        const pSnap = await getDocs(collection(db, "products_v2"));
        setProducts(pSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
      } catch (e) {
        console.error("Dashboard load error:", e);
        setErr("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------------- calculations ----------------------- */
  const calc = useMemo(() => {
    const daysArr = lastNDays(12);
    const dayLabels = daysArr.map(fmtDay);
    const dayIndex = Object.fromEntries(dayLabels.map((k, i) => [k, i]));

    // --- Users metrics ---
    const totalUsers = users.length;
    const activeUsers = users.filter(
      (u) => norm(u.subscriptionStatus) === "active"
    );
    const activeSubscriptionsCount = activeUsers.length;
    const activeSubscriptionsAmount = activeUsers.reduce(
      (sum, u) => sum + Number(u.price || 0),
      0
    );

    // new users per day
    const usersPerDay = new Array(daysArr.length).fill(0);
    for (const u of users) {
      const d = toDate(u.createdAt);
      if (!d) continue;
      const key = fmtDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      const idx = dayIndex[key];
      if (idx != null) usersPerDay[idx]++;
    }

    // Revenue
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    let revenueMTD = 0;
    const revenuePerDay = new Array(daysArr.length).fill(0);
    for (const u of users) {
      const price = Number(u.price || 0);
      const status = norm(u.subscriptionStatus);
      const started = toDate(u.subscriptionStartDate);
      if (!started || !price) continue;
      if (started >= monthStart && started <= monthEnd && status === "active") {
        revenueMTD += price;
      }
      const key = fmtDay(
        new Date(started.getFullYear(), started.getMonth(), started.getDate())
      );
      const idx = dayIndex[key];
      if (idx != null && status === "active") revenuePerDay[idx] += price;
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
    // Now only 2 types: barcode and userSubmitted
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
      revenuePerDay,
      mediumWise,
    };

    return {
      totalUsers,
      activeSubscriptionsCount,
      activeSubscriptionsAmount,
      revenueEarned: revenueMTD,
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
    activeSubscriptionsCount: calc.activeSubscriptionsCount,
    activeSubscriptionsAmount: calc.activeSubscriptionsAmount.toFixed(2),
    revenueEarned: calc.revenueEarned.toFixed(2),
    series: calc.series,
    recent: calc.recent,
    topProducts: calc.topProducts,
  };
  const vb = calc.verdictBreakdown;

  return (
    <>
      <h2 style={{ marginTop: 0, marginBottom: 14 }}>Dashboard</h2>

      {/* KPIs */}
      <div className="grid cols-4">
        <StatCard
          label="Total Users"
          value={m.totalUsers}
          delta="+2.1% vs last week"
        />
        <StatCard
          label="Active Subscriptions"
          value={m.activeSubscriptionsCount}
          delta="+1.2%"
        />
        <StatCard
          label="Active Subs Amount"
          value={`$${m.activeSubscriptionsAmount}`}
          delta="+0.8%"
        />
        <StatCard
          label="Revenue (MTD)"
          value={`$${m.revenueEarned}`}
          delta="+2.3%"
        />
      </div>

      <div className="space" />

      {/* Charts row */}
      <div className="grid cols-3">
        <ChartBar
          title="Scans & New Users (last 12 days)"
          labels={m.series.days}
          seriesA={m.series.scansPerDay}
          seriesB={m.series.usersPerDay}
          labelA="Scans"
          labelB="New Users"
        />
        <ChartDonut
          title="Verdict Breakdown (All Products)"
          labels={["Halal", "Haram", "Suspicious"]}
          values={[vb.halal, vb.haram, vb.suspicious]}
        />
        <ChartLine
          title="Revenue Trend (last 12 days)"
          labels={m.series.days}
          series={m.series.revenuePerDay}
          label="Revenue"
        />
      </div>

      <div className="space" />

      {/* Bottom row: activity + top products + medium-wise */}
      <div className="grid cols-3">
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Recent Activity
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {calc.recent.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span>
                  <span
                    className={`badge ${item.type === "warn" ? "warn" : "ok"}`}
                    style={{ marginRight: 8 }}
                  >
                    {item.type === "warn" ? "!" : "✓"}
                  </span>
                  {item.title}
                </span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Top Products by Scans
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Scans</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {calc.topProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.scans}</td>
                  <td>
                    <span
                      className={`chip ${
                        p.verdict === "halal"
                          ? "green"
                          : p.verdict === "haram"
                          ? "red"
                          : "amber"
                      }`}
                    >
                      <span className="dot" />
                      {p.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
    </>
  );
}
