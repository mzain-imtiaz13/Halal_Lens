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
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [cursors, setCursors] = useState([]);

  // history modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scans, setScans] = useState([]);
  const [scansLoading, setScansLoading] = useState(false);
  const [scansCursor, setScansCursor] = useState(null);

  // Count total for pager (only when admin)
  useEffect(() => {
    if (authLoading) return;
    if (!user || isAdmin !== true) {
      setTotal(0);
      return;
    }
    (async () => {
      const t = await countUsersFirebase({ plan, status });
      setTotal(t);
    })();
  }, [authLoading, user, isAdmin, plan, status]);

  // Fetch list page (only when admin)
  useEffect(() => {
    if (authLoading) return;
    if (!user || isAdmin !== true) {
      setRows([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
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
        if (isCancelled) return;
        setRows(items);

        setCursors((prev) => {
          const copy = [...prev];
          if (page - 1 === copy.length && nextCursor) copy.push(nextCursor);
          return copy;
        });
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin, q, plan, status, page, pageSize]);

  const reset = () => {
    setQ("");
    setPlan("");
    setStatus("");
    setPage(1);
    setCursors([]);
  };

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

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Plan", dataIndex: "subscription_plan" },
    { title: "Price", dataIndex: "price", render: (v) => (v ? `$${v}` : "-") },
    { title: "Start", dataIndex: "subscription_start" },
    { title: "End", dataIndex: "subscription_end" },
    { title: "Total Scans", dataIndex: "total_scans" },
    {
      title: "Actions",
      render: (_, row) => (
        <button className="btn small" onClick={() => openHistory(row)}>
          Scans History
        </button>
      ),
    },
  ];

  if (authLoading) return <>Loading...</>;
  if (!user) return <>Please sign in.</>;
  if (isAdmin === false) return <>You are not authorized to view this page.</>;

  return (
    <>
      <h2>Users</h2>
      <Toolbar onReset={reset}>
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
        <select
          className="select"
          value={plan}
          onChange={(e) => {
            setPage(1);
            setCursors([]);
            setPlan(e.target.value);
          }}
        >
          <option value="">All Plans</option>
          <option value="Free">Free</option>
          <option value="Premium">Trial Standard</option>
          <option value="Premium">Standard (Monthly)</option>
          <option value="Premium">Standard (Yearly)</option>
        </select>
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
              if (p - 1 < cursors.length) {
                setCursors((prev) => prev.slice(0, Math.max(0, p - 1)));
              }
            }}
          />
        </>
      )}

      <Modal isOpen={historyOpen} onClose={closeHistory}>
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Scan History
            </h3>
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
    </>
  );
}
