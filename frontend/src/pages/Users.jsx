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
import Button from "../components/Button";
import { formatDate } from "../utils/dateUtils";

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
  const [pageSize, setPageSize] = useState(25);
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

        // Fetch users with the search query applied
        const { items, nextCursor } = await listUsersFirebase({
          search: q,
          plan,
          status,
          pageSize,
          cursorDoc,
        });

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
    {
      title: "Created At",
      dataIndex: "created_at",
      render: (_, row) => formatDate(row.created_at),
    },
    {
      title: "Actions",
      render: (_, row) => (
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={() => openHistory(row)}>
            Scans
          </Button>

          <Button variant="secondary" onClick={() => openBillingHistory(row)}>
            Subscriptions
          </Button>
        </div>
      ),
    },
  ];
  const searchHandler = (e) => {
    setPage(1); // Reset to the first page when searching
    setQ(e.target.value); // Set the search query
  };
  /* ---------------- Render ---------------- */
  if (authLoading) return <>Loading...</>;
  if (!user) return <>Please sign in.</>;
  if (!isAdmin) return <>You are not authorized.</>;

  return (
    <>
      <Toolbar onReset={reset} title={"Users & Subscriptions"}>
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          style={{ minWidth: 240 }}
          placeholder="Search name or email..."
          value={q}
          onChange={searchHandler}
        />
      </Toolbar>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {/* Scan History Modal */}
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
            <DataTable
              columns={[
                {
                  title: "Image",
                  dataIndex: "frontImageUrl",
                  render: (value) =>
                    value ? (
                      <img
                        src={value}
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
                    ),
                },
                {
                  title: "Product",
                  dataIndex: "productName",
                  render: (value, row) => (
                    <div>
                      <div style={{ fontWeight: 600 }}>{value}</div>
                      <div className="helper" style={{ fontSize: 12 }}>
                        {row.productBrands}
                      </div>
                    </div>
                  ),
                },
                { title: "Barcode", dataIndex: "barcode" },
                {
                  title: "Verdict",
                  dataIndex: "overallStatus",
                  render: (value) => (
                    <span
                      className={`badge ${
                        value === "halal"
                          ? "ok"
                          : value === "haram"
                          ? "danger"
                          : "warn"
                      }`}
                    >
                      {value}
                    </span>
                  ),
                },
                { title: "Type", dataIndex: "scanType" },
                { title: "Scanned At", dataIndex: "scannedAt" },
              ]}
              data={scans}
              loading={scansLoading}
              page={page}
              pageSize={5}
            />
          </div>

          <div className="space" />
          <div className="row" style={{ justifyContent: "center" }}>
            <Button
              variant="secondary"
              disabled={!scansCursor || scansLoading}
              onClick={loadMoreScans}
            >
              {scansLoading
                ? "Loading..."
                : scansCursor
                ? "Load more"
                : "No more"}
            </Button>
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
