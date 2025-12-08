// src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import {
  listUsersFirebase,
  countUsersFirebase,
  listUserScanHistory,
} from "../api/services/users_firebase";
import { useAuth } from "../contexts/AuthContext";
import BillingHistoryTable from "./Billing/BillingHistoryTable";
import "./../styles.css";

export default function Users() {
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [cursors, setCursors] = useState([]);

  // scan history modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scans, setScans] = useState([]);
  const [scansCursor, setScansCursor] = useState(null);
  const [scansLoading, setScansLoading] = useState(false);

  // billing history modal
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingUser, setBillingUser] = useState(null);

  const openBillingHistory = (userRow) => {
    setBillingUser(userRow);
    setBillingOpen(true);
  };

  const closeBillingHistory = () => {
    setBillingOpen(false);
    setBillingUser(null);
  };

  /* ---------------- Fetch total users ---------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      setTotal(0);
      return;
    }

    (async () => {
      const t = await countUsersFirebase({ plan, status });
      setTotal(t);
    })();
  }, [authLoading, user, isAdmin, plan, status]);

  /* ---------------- Fetch users list ---------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const cursorDoc = page > 1 ? cursors[page - 2] || null : null;

        const { items, nextCursor } = await listUsersFirebase({
          search: q,
          plan,
          status,
          pageSize,
          cursorDoc,
        });
        console.log(items)

        if (!cancelled) {
          setRows(items);

          setCursors((prev) => {
            const copy = [...prev];
            if (page - 1 === copy.length && nextCursor) copy.push(nextCursor);
            return copy;
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => (cancelled = true);
  }, [authLoading, user, isAdmin, q, plan, status, page, pageSize]);

  /* ---------------- Reset Filters ---------------- */
  const reset = () => {
    setQ("");
    setPlan("");
    setStatus("");
    setPage(1);
    setCursors([]);
  };

  /* ---------------- Open Scan History ---------------- */
  const openHistory = async (userRow) => {
    setSelectedUser(userRow);
    setHistoryOpen(true);
    setScans([]);
    setScansCursor(null);
    setScansLoading(true);

    try {
      const { items, nextCursor } = await listUserScanHistory({
        userId: userRow.id,
        pageSize: 20,
      });
      setScans(items);
      setScansCursor(nextCursor);
    } finally {
      setScansLoading(false);
    }
  };

  const loadMoreScans = async () => {
    if (!selectedUser || !scansCursor) return;

    setScansLoading(true);

    try {
      const { items, nextCursor } = await listUserScanHistory({
        userId: selectedUser.id,
        pageSize: 20,
        cursorDoc: scansCursor,
      });
      setScans((prev) => [...prev, ...items]);
      setScansCursor(nextCursor);
    } finally {
      setScansLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedUser(null);
    setScans([]);
    setScansCursor(null);
  };

  /* ---------------- Users Table Columns ---------------- */
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
    { title: "Source", dataIndex: "authProvider" },
    { title: "Status", dataIndex: "status" },
    { title: "Country", dataIndex: "country" },
    { title: "Mobile", dataIndex: "mobile" },
    { title: "Total Scans", dataIndex: "total_scans" },
    { title: "Created At", dataIndex: "created_at" },
    {
      title: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button className="btn small" onClick={() => openHistory(row)}>
            Scans
          </button>
          <button className="btn small" onClick={() => openBillingHistory(row)}>
            Subscriptions
          </button>
        </div>
      ),
    },
  ];

  /* ---------------- Render ---------------- */
  if (authLoading) return <>Loading...</>;
  if (!user) return <>Please sign in.</>;
  if (!isAdmin) return <>You are not authorized.</>;

  return (
    <>
      <Toolbar onReset={reset} title={"Users & Subscriptions"}>
        <input
          className="input"
          style={{ minWidth: 240 }}
          placeholder="Search name or email..."
          value={q}
          onChange={(e) => {
            setPage(1);
            setCursors([]);
            setQ(e.target.value);
          }}
        />
      </Toolbar>

      <div className="space" />

      {loading ? (
        "Loading..."
      ) : (
        <>
          <DataTable columns={columns} data={rows} />

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => {
              setPage(p);
              if (p - 1 < cursors.length)
                setCursors((prev) => prev.slice(0, Math.max(0, p - 1)));
            }}
          />
        </>
      )}

      {/* Scan History Modal */}
      <Modal isOpen={historyOpen} onClose={closeHistory}>
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Scan History</h3>
            {selectedUser && (
              <p className="mt-1 text-sm text-slate-500">
                {selectedUser.name} • {selectedUser.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Barcode</th>
                  <th>Verdict</th>
                  <th>Type</th>
                  <th>Scanned At</th>
                </tr>
              </thead>
              <tbody>
                {scans.length === 0 && (
                  <tr>
                    <td className="table-empty" colSpan={6}>
                      {scansLoading ? "Loading..." : "No scans found"}
                    </td>
                  </tr>
                )}

                {scans.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.frontImageUrl ? (
                        <img
                          src={s.frontImageUrl}
                          alt=""
                          style={{
                            width: 54,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid var(--border)",
                          }}
                        />
                      ) : (
                        <span className="helper">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.productName}</div>
                      <div className="helper" style={{ fontSize: 12 }}>
                        {s.productBrands}
                      </div>
                    </td>
                    <td>{s.barcode}</td>
                    <td>
                      <span
                        className={`badge ${
                          s.overallStatus === "halal"
                            ? "ok"
                            : s.overallStatus === "haram"
                            ? "danger"
                            : "warn"
                        }`}
                      >
                        {s.overallStatus}
                      </span>
                    </td>
                    <td>{s.scanType}</td>
                    <td>{s.scannedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space" />
          <div className="row" style={{ justifyContent: "center" }}>
            <button
              className="btn"
              disabled={!scansCursor || scansLoading}
              onClick={loadMoreScans}
            >
              {scansLoading
                ? "Loading..."
                : scansCursor
                ? "Load more"
                : "No more"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Billing History Modal */}
      <Modal isOpen={billingOpen} onClose={closeBillingHistory}>
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Billing History
            </h3>
            {billingUser && (
              <p className="mt-1 text-sm text-slate-500">
                {billingUser.name} • {billingUser.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          {billingUser ? (
            <BillingHistoryTable userId={billingUser.id} />
          ) : (
            <div className="text-sm text-slate-600">No user selected.</div>
          )}
        </div>
      </Modal>
    </>
  );
}
