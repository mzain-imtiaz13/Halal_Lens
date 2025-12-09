// components/shops/NutrimentRow.jsx
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";

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
      <Button variant="danger" outline type="button" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}
