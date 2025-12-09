import React from "react";
import Button from "./Button";

export default function DataTable({
  columns,
  data,
  loading = false,
  // optional pagination props
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) {
  const isPaginated =
    typeof page === "number" &&
    typeof pageSize === "number" &&
    typeof total === "number";

  const totalPages = isPaginated
    ? Math.max(1, Math.ceil(total / pageSize))
    : 1;

  const handlePrev = () => {
    if (!isPaginated || !onPageChange || loading) return;
    onPageChange(Math.max(1, page - 1));
  };

  const handleNext = () => {
    if (!isPaginated || !onPageChange || loading) return;
    onPageChange(Math.min(totalPages, page + 1));
  };

  const handlePageSizeChange = (e) => {
    if (!onPageSizeChange || loading) return;
    const newSize = Number(e.target.value || 10);
    onPageSizeChange(newSize);
    if (onPageChange) onPageChange(1);
  };

  // how many skeleton rows to show when loading
  const skeletonRowCount = Math.max(5, Math.min(pageSize || 10, 10));

  return (
    <div className="space-y-3">
      {/* Pagination footer (optional) */}
      {isPaginated && (
        <div className="mt-1 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
          {/* When loading: show skeleton shimmer instead of real controls */}
          {loading ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-4 w-24 rounded-full bg-slate-100 animate-pulse" />
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <div className="h-8 w-20 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </>
          ) : (
            <>
              {/* Page size selector */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Rows per page:</span>
                <select
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  {[5, 10, 25, 50, 100].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info */}
              <span className="text-sm text-slate-600">
                Page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages}</span> •{" "}
                <span className="font-medium">{total}</span> items
              </span>

              <div className="flex-1" />

              {/* Nav buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  outline
                  onClick={handlePrev}
                  disabled={page <= 1}
                >
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  outline
                  onClick={handleNext}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead className="bg-linear-to-b from-slate-50 to-slate-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key || col.dataIndex}
                    className="sticky top-0 z-10 border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {/* Skeleton rows when loading */}
              {loading &&
                Array.from({ length: skeletonRowCount }).map((_, rowIdx) => (
                  <tr key={`skeleton-${rowIdx}`} className="animate-pulse">
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key || col.dataIndex}
                        className={`border-b border-slate-200 px-4 py-3 text-sm ${
                          colIdx === 0 ? "border-l-4 border-transparent" : ""
                        }`}
                      >
                        <div className="h-3.5 w-3/5 rounded-full bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))}

              {/* No results (only when not loading) */}
              {!loading && data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No results
                  </td>
                </tr>
              )}

              {/* Real rows */}
              {!loading &&
                data.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="transition-all hover:bg-slate-50/80"
                  >
                    {columns.map((col, cidx) => (
                      <td
                        key={col.key || col.dataIndex}
                        className={`border-b border-slate-200 px-4 py-3 text-sm ${
                          cidx === 0 ? "border-l-4 border-transparent" : ""
                        }`}
                      >
                        {col.render
                          ? col.render(row[col.dataIndex], row)
                          : row[col.dataIndex]}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
