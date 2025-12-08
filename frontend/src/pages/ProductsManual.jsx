import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal"; // ⬅️ use your Modal here
import { listManualProducts } from "../api/services/products";
import "./../styles.css";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">
      <rect width="120" height="80" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="10" fill="#6b7280">No Image</text>
    </svg>
  `);

function VerdictBadge({ value }) {
  let badgeClasses =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ";
  let dotClasses = "h-1.5 w-1.5 rounded-full ";

  if (value === "halal") {
    badgeClasses += "border-brand-200 bg-brand-50 text-brand-700";
    dotClasses += "bg-brand-500";
  } else if (value === "haram") {
    badgeClasses += "border-red-200 bg-red-50 text-red-700";
    dotClasses += "bg-red-500";
  } else if (value === "suspicious") {
    badgeClasses += "border-amber-200 bg-amber-50 text-amber-700";
    dotClasses += "bg-amber-500";
  } else {
    badgeClasses += "border-slate-200 bg-slate-50 text-slate-600";
    dotClasses += "bg-slate-400";
  }

  return (
    <span className={badgeClasses}>
      <span className={dotClasses} />
      {value || "-"}
    </span>
  );
}

function ManualProductDetailsModal({ open, onClose, data }) {
  if (!open || !data) return null;

  const extra = data?._extra || {};
  const ingredients = Array.isArray(extra.ingredients) ? extra.ingredients : [];
  const references = Array.isArray(extra.references) ? extra.references : [];

  return (
    <Modal isOpen={open} onClose={onClose}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Manual product details
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {data?.product_name || "-"}
          </p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="max-h-[70vh] space-y-6">
        {/* Images */}
        <section>
          <h4 className="mb-2 text-sm font-semibold text-slate-800">
            Uploaded Images
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            {extra.frontImageUrl && (
              <img
                src={extra.frontImageUrl}
                alt="front"
                className="h-32 w-40 rounded-lg border border-slate-200 object-cover"
              />
            )}
            {extra.backImageUrl && (
              <img
                src={extra.backImageUrl}
                alt="back"
                className="h-32 w-40 rounded-lg border border-slate-200 object-cover"
              />
            )}
            {!extra.frontImageUrl && !extra.backImageUrl && (
              <p className="text-sm text-slate-500">No images available.</p>
            )}
          </div>
        </section>

        {/* Overview + Ingredients */}
        <section className="flex flex-col gap-6">
          {/* Overview */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Overview</h4>
            <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-3 gap-y-2 text-sm">
              <dt className="text-slate-500">Product ID</dt>
              <dd className="text-slate-800">{extra.id || "-"}</dd>

              <dt className="text-slate-500">Barcode</dt>
              <dd className="text-slate-800">{extra.barcode || "-"}</dd>

              <dt className="text-slate-500">Brands</dt>
              <dd className="text-slate-800">{extra.brands || "-"}</dd>

              <dt className="text-slate-500">Source</dt>
              <dd className="text-slate-800">{extra.dataSource || "-"}</dd>

              <dt className="text-slate-500">Added By</dt>
              <dd className="text-slate-800">{extra.addedByUserId || "-"}</dd>

              <dt className="text-slate-500">Verified</dt>
              <dd className="text-slate-800">
                {extra.isVerified ? "Yes" : "No"}
              </dd>

              <dt className="text-slate-500">Admin Verdict</dt>
              <dd>
                <VerdictBadge value={data?.admin_verdict} />
              </dd>

              <dt className="text-slate-500">Reason</dt>
              <dd className="text-slate-800">{extra.statusReason || "-"}</dd>

              <dt className="text-slate-500">Submitted</dt>
              <dd className="text-slate-800">{extra.createdAt || "-"}</dd>

              <dt className="text-slate-500">Updated</dt>
              <dd className="text-slate-800">{extra.updatedAt || "-"}</dd>
            </dl>
          </div>

          {/* Ingredients */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-800">
              Ingredients
            </h4>
            {!ingredients.length ? (
              <div className="mt-4 text-center text-sm text-slate-500">
                No ingredients
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
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
                    {ingredients.map((it, i) => {
                      const totalVotes =
                        (it?.halalVotes ?? 0) +
                        (it?.haramVotes ?? 0) +
                        (it?.suspiciousVotes ?? 0);
                      return (
                        <tr
                          key={i}
                          className="border-b border-slate-100 hover:bg-slate-50/70"
                        >
                          <td className="px-3 py-2 text-slate-800">
                            {it?.name || "-"}
                          </td>
                          <td className="px-3 py-2">
                            <VerdictBadge value={it?.status} />
                          </td>
                          <td
                            className="max-w-xs truncate px-3 py-2 text-slate-700"
                            title={it?.reason || ""}
                          >
                            {it?.reason || "-"}
                          </td>
                          <td className="px-3 py-2 text-slate-800">
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
        </section>

        {/* References */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-800">References</h4>
          {!references.length ? (
            <div className="mt-4 text-center text-sm text-slate-500">
              No references
            </div>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {references.map((r, i) => (
                <li key={i}>
                  <div className="font-semibold text-slate-900">
                    {r?.title || "-"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r?.notes || "-"}
                  </div>
                  {r?.url && (
                    <div className="mt-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex cursor-pointer items-center text-xs font-medium text-brand-700 hover:text-brand-800"
                      >
                        Open link
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  );
}

export default function ProductsManual() {
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
      const resp = await listManualProducts({ verdict, q, page, pageSize });
      setRows(resp.data.items);
      setTotal(resp.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verdict, q, page]);

  const reset = () => {
    setVerdict("");
    setQ("");
    setPage(1);
  };

  const Img = ({ src }) => (
    <img
      src={src || PLACEHOLDER_IMG}
      onError={(e) => {
        e.currentTarget.src = PLACEHOLDER_IMG;
      }}
      width={64}
      height={46}
      className="h-[46px] w-16 rounded-md border border-slate-200 object-cover"
      alt="product"
    />
  );

  const columns = [
    { title: "Product ID", dataIndex: "id" },
    { title: "Product Name", dataIndex: "product_name" },
    {
      title: "Uploaded Images",
      key: "images",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Img src={row.img_front_url} />
          <Img src={row.img_ingredients_url} />
        </div>
      ),
    },
    {
      title: "Verdict",
      dataIndex: "admin_verdict",
      render: (v) => <VerdictBadge value={v} />,
    },
    { title: "Date of Submission", dataIndex: "submitted_at" },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) => (
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={() => {
            setActiveRow(row);
            setDetailsOpen(true);
          }}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <>
      <Toolbar
        title="Manual Product Listing"
        onReset={reset}
        left={
          <>
            <input
              className="input"
              style={{ minWidth: 240 }}
              placeholder="Search product..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="select"
              value={verdict}
              onChange={(e) => {
                setVerdict(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="halal">Halal</option>
              <option value="haram">Haram</option>
              <option value="suspicious">Suspicious</option>
            </select>
          </>
        }
      />

      {loading ? (
        <div className="py-8 text-sm text-slate-500">Loading…</div>
      ) : (
        <>
          <DataTable columns={columns} data={rows} pageSize={rows.length || 10} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
          />
        </>
      )}

      <ManualProductDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        data={activeRow}
      />
    </>
  );
}
