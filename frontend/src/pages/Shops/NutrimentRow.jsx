// components/shops/NutrimentRow.jsx
import React, { useEffect, useState } from "react";

export const makeEmptyNutri = () => ({ key: "", value: "" });

export default function NutrimentRow({ value, onChange, onRemove }) {
  const [x, setX] = useState(value || makeEmptyNutri());

  useEffect(() => {
    setX(value || makeEmptyNutri());
  }, [value]);

  const upd = (patch) => {
    const n = { ...x, ...patch };
    setX(n);
    onChange(n);
  };

  return (
    <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs md:grid-cols-[1.5fr,1fr,auto]">
      <input
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Key (e.g., energy-kcal_100g)"
        value={x.key}
        onChange={(e) => upd({ key: e.target.value })}
      />
      <input
        type="number"
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Value"
        value={x.value}
        onChange={(e) => upd({ value: e.target.value })}
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
