import React from "react";
import Button from "./Button";

export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
      {/* Info */}
      <span className="text-sm text-slate-600">
        Page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{totalPages}</span> •{" "}
        <span className="font-medium">{total}</span> items
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" outline onClick={prev} disabled={page <= 1}>
          Prev
        </Button>

        <Button
          variant="secondary"
          outline
          onClick={next}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
