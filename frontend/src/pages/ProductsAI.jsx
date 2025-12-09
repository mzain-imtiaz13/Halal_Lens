import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import { listAIProducts } from "../api/services/products";
import Button from "../components/Button";

function ProductDetailsModal({ open, onClose, data }) {
  if (!open || !data) return null;

  const x = data._extra || {};
  const ing = Array.isArray(x.ingredients) ? x.ingredients : [];
  const refs = Array.isArray(x.references) ? x.references : [];

  const verdictClass =
    data.ai_verdict === "halal"
      ? "green"
      : data.ai_verdict === "haram"
      ? "red"
      : "amber";

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Product details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Full AI analysis, ingredients and references for this product.
            </p>
          </div>
        </div>

        {/* Product title + images */}
        <div>
          <div className="mb-3 text-base font-extrabold text-slate-900">
            {data.product_name}
          </div>
          <div className="flex flex-wrap gap-3">
            {x.frontImageUrl && (
              <img
                src={x.frontImageUrl}
                alt="front"
                className="h-40 w-auto rounded-md border border-slate-200 object-cover"
              />
            )}
            {x.backImageUrl && (
              <img
                src={x.backImageUrl}
                alt="back"
                className="h-40 w-auto rounded-md border border-slate-200 object-cover"
              />
            )}
          </div>
        </div>

        {/* Overview + Ingredients */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Overview */}
          <div className="card">
            <div className="card-title">Overview</div>
            <div className="kv" style={{ marginTop: 8 }}>
              <div className="muted">Barcode</div>
              <div>{x.barcode || "-"}</div>

              <div className="muted">Brands</div>
              <div>{x.brands || "-"}</div>

              <div className="muted">Data Source</div>
              <div>{x.dataSource || "-"}</div>

              <div className="muted">Added By</div>
              <div>{x.addedByUserId || "-"}</div>

              <div className="muted">Verified</div>
              <div>{x.isVerified ? "Yes" : "No"}</div>

              <div className="muted">AI Verdict</div>
              <div>
                <span className={`chip ${verdictClass}`}>
                  <span className="dot" /> {data.ai_verdict || "-"}
                </span>
              </div>

              <div className="muted">Reason</div>
              <div>{x.statusReason || "-"}</div>

              <div className="muted">Created</div>
              <div>{x.createdAt || "-"}</div>

              <div className="muted">Updated</div>
              <div>{x.updatedAt || "-"}</div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="card">
            <div className="card-title">Ingredients</div>
            {!ing.length ? (
              <div className="table-empty">No ingredients</div>
            ) : (
              <table className="table compact" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {ing.map((it, i) => {
                    const statusClass =
                      it?.status === "halal"
                        ? "green"
                        : it?.status === "haram"
                        ? "red"
                        : "amber";

                    const totalVotes =
                      (it?.halalVotes ?? 0) +
                      (it?.haramVotes ?? 0) +
                      (it?.suspiciousVotes ?? 0);

                    return (
                      <tr key={i}>
                        <td>{it?.name || "-"}</td>
                        <td>
                          <span className={`chip ${statusClass}`}>
                            <span className="dot" /> {it?.status || "-"}
                          </span>
                        </td>
                        <td
                          style={{
                            maxWidth: 260,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={it?.reason || ""}
                        >
                          {it?.reason || "-"}
                        </td>
                        <td>{totalVotes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* References */}
        <div className="card">
          <div className="card-title">References</div>
          {!refs.length ? (
            <div className="table-empty">No references</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {refs.map((r, i) => (
                <li key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700 }}>{r?.title || "-"}</div>
                  <div className="helper">{r?.notes || "-"}</div>
                  {r?.url && (
                    <div style={{ marginTop: 6 }}>
                      <a
                        className="btn link"
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open link
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function ProductsAI() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await listAIProducts({ verdict, q, page, pageSize });
      setRows(resp.data.items);
      setTotal(resp.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [verdict, q, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setVerdict("");
    setQ("");
    setPage(1);
  };

  const columns = [
    { title: "Product", dataIndex: "product_name" },
    { title: "Medium", dataIndex: "medium" },
    { title: "Ingredients", dataIndex: "ingredients_preview" },
    {
      title: "AI Verdict",
      dataIndex: "ai_verdict",
      render: (v) => (
        <span
          className={`chip ${
            v === "halal" ? "green" : v === "haram" ? "red" : "amber"
          }`}
        >
          <span className="dot" /> {v}
        </span>
      ),
    },
    { title: "Haram ingredients", dataIndex: "haram_ingredients" },
    { title: "Suspicious ingredients", dataIndex: "suspicious_ingredients" },
    { title: "Source", dataIndex: "api_source" },
    { title: "Date Added", dataIndex: "date_added" },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) => (
        <div className="row">
          <Button
            variant="secondary"
            onClick={() => {
              setActiveRow(row);
              setDetailsOpen(true);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <h2>AI Product Listing</h2>

      <Toolbar onReset={reset}>
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          style={{ minWidth: 240 }}
          placeholder="Search product or ingredient..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          value={verdict}
          onChange={(e) => {
            setVerdict(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Verdicts</option>
          <option value="halal">Halal</option>
          <option value="haram">Haram</option>
          <option value="suspicious">Suspicious</option>
        </select>
      </Toolbar>

      <div className="space" />

      {loading ? (
        "Loading..."
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            pageSize={rows.length || 10}
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
          />
        </>
      )}

      <ProductDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        data={activeRow}
      />
    </>
  );
}
