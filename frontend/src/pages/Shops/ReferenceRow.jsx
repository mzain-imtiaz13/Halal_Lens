// components/shops/ReferenceRow.jsx
import React, { useEffect, useState } from "react";

export const makeEmptyRef = () => ({ title: "", url: "", notes: "" });

export default function ReferenceRow({ value, onChange, onRemove }) {
  const [x, setX] = useState(value || makeEmptyRef());

  useEffect(() => {
    setX(value || makeEmptyRef());
  }, [value]);

  const upd = (patch) => {
    const n = { ...x, ...patch };
    setX(n);
    onChange(n);
  };

  return (
    <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs md:grid-cols-[1.2fr,1.2fr,1.4fr,auto]">
      <input
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Title"
        value={x.title}
        onChange={(e) => upd({ title: e.target.value })}
      />
      <input
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="URL"
        value={x.url}
        onChange={(e) => upd({ url: e.target.value })}
      />
      <input
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Notes"
        value={x.notes}
        onChange={(e) => upd({ notes: e.target.value })}
      />
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center justify-center rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"
      >
        Remove
      </button>
    </div>
  );
}
