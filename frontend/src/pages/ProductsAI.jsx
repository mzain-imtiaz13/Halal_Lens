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
              Full AI analysis, ingredients, and references for this product.
            </p>
          </div>
        </div>

        {/* Product title + images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-brand-600">
                Product
              </p>
              <div className="text-base font-semibold text-slate-900">
                {data.product_name}
              </div>
            </div>

            {data.ai_verdict && (
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
                  data.ai_verdict === "halal"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : data.ai_verdict === "haram"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    data.ai_verdict === "halal"
                      ? "bg-emerald-500"
                      : data.ai_verdict === "haram"
                      ? "bg-red-500"
                      : "bg-amber-500",
                  ].join(" ")}
                />
                {data.ai_verdict || "-"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {x.frontImageUrl && (
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={x.frontImageUrl}
                  alt="front"
                  className="h-40 w-auto object-cover"
                />
              </div>
            )}
            {x.backImageUrl && (
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={x.backImageUrl}
                  alt="back"
                  className="h-40 w-auto object-cover"
                />
              </div>
            )}
            {!x.frontImageUrl && !x.backImageUrl && (
              <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
                No product images available
              </div>
            )}
          </div>
        </div>

        {/* Overview + Ingredients */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Overview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Overview</h3>
            <dl className="mt-3 grid grid-cols-[120px,1fr] gap-y-2 text-xs sm:text-sm">
              <dt className="text-slate-500">Barcode</dt>
              <dd className="font-medium text-slate-800">{x.barcode || "-"}</dd>

              <dt className="text-slate-500">Brands</dt>
              <dd className="font-medium text-slate-800">{x.brands || "-"}</dd>

              <dt className="text-slate-500">Data Source</dt>
              <dd className="text-slate-800">{x.dataSource || "-"}</dd>

              <dt className="text-slate-500">Added By</dt>
              <dd className="text-slate-800">{x.addedByUserId || "-"}</dd>

              <dt className="text-slate-500">Verified</dt>
              <dd className="text-slate-800">{x.isVerified ? "Yes" : "No"}</dd>

              <dt className="text-slate-500">AI Verdict</dt>
              <dd className="text-slate-800">
                {data.ai_verdict ? (
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      data.ai_verdict === "halal"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : data.ai_verdict === "haram"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        data.ai_verdict === "halal"
                          ? "bg-emerald-500"
                          : data.ai_verdict === "haram"
                          ? "bg-red-500"
                          : "bg-amber-500",
                      ].join(" ")}
                    />
                    {data.ai_verdict}
                  </span>
                ) : (
                  "-"
                )}
              </dd>

              <dt className="text-slate-500">Reason</dt>
              <dd className="text-slate-800">{x.statusReason || "-"}</dd>

              <dt className="text-slate-500">Created</dt>
              <dd className="text-slate-800 text-xs sm:text-sm">
                {x.createdAt || "-"}
              </dd>

              <dt className="text-slate-500">Updated</dt>
              <dd className="text-slate-800 text-xs sm:text-sm">
                {x.updatedAt || "-"}
              </dd>
            </dl>
          </div>

          {/* Ingredients */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Ingredients
            </h3>
            {!ing.length ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No ingredients found for this product.
              </div>
            ) : (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full border-collapse text-xs sm:text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <th className="border-b border-slate-200 px-3 py-2">
                        Name
                      </th>
                      <th className="border-b border-slate-200 px-3 py-2">
                        Status
                      </th>
                      <th className="border-b border-slate-200 px-3 py-2">
                        Reason
                      </th>
                      <th className="border-b border-slate-200 px-3 py-2">
                        Votes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ing.map((it, i) => {
                      const status = it?.status;
                      const totalVotes =
                        (it?.halalVotes ?? 0) +
                        (it?.haramVotes ?? 0) +
                        (it?.suspiciousVotes ?? 0);

                      const statusClasses =
                        status === "halal"
                          ? {
                              badge:
                                "border-emerald-200 bg-emerald-50 text-emerald-700",
                              dot: "bg-emerald-500",
                            }
                          : status === "haram"
                          ? {
                              badge: "border-red-200 bg-red-50 text-red-700",
                              dot: "bg-red-500",
                            }
                          : {
                              badge:
                                "border-amber-200 bg-amber-50 text-amber-700",
                              dot: "bg-amber-500",
                            };

                      return (
                        <tr
                          key={i}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-3 py-2 align-top text-slate-800">
                            {it?.name || "-"}
                          </td>
                          <td className="px-3 py-2 align-top">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClasses.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`}
                              />
                              {status || "-"}
                            </span>
                          </td>
                          <td
                            className="max-w-xs px-3 py-2 align-top text-slate-700"
                            title={it?.reason || ""}
                          >
                            <span className="line-clamp-2 text-xs sm:text-[13px]">
                              {it?.reason || "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top text-right text-slate-800">
                            {totalVotes}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* References */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">References</h3>
          {!refs.length ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No references have been attached to this analysis.
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {refs.map((r, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {r?.title || "-"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {r?.notes || "-"}
                  </div>
                  {r?.url && (
                    <div className="mt-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        Open link
                        <span className="ml-1 text-[11px]">↗</span>
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
  const [pageSize, setPageSize] = useState(25);
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
  }, [verdict, q, page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <DataTable
        loading={loading}
        columns={columns}
        data={rows}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <ProductDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        data={activeRow}
      />
    </>
  );
}
