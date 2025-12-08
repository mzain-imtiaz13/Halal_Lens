// components/shops/IngredientRow.jsx
import React, { useEffect, useState } from "react";

export const makeEmptyIngredient = () => ({
  name: "",
  status: "suspicious",
  reason: "",
  halalVotes: 0,
  suspiciousVotes: 0,
  haramVotes: 0,
  votedUserIds: [],
});

export default function IngredientRow({ value, onChange, onRemove }) {
  const [x, setX] = useState(value || makeEmptyIngredient());

  useEffect(() => {
    setX(value || makeEmptyIngredient());
  }, [value]);

  const upd = (patch) => {
    const n = { ...x, ...patch };
    setX(n);
    onChange(n);
  };

  const votesRow = (
    <div>
      <div className="grid gap-2 md:grid-cols-3 items-end">
        {/* Halal */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-600">
            Halal votes
          </label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            value={x.halalVotes}
            onChange={(e) => upd({ halalVotes: Number(e.target.value || 0) })}
          />
        </div>

        {/* Suspicious */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-600">
            Suspicious votes
          </label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            value={x.suspiciousVotes}
            onChange={(e) =>
              upd({ suspiciousVotes: Number(e.target.value || 0) })
            }
          />
        </div>

        {/* Haram */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-600">
            Haram votes
          </label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            value={x.haramVotes}
            onChange={(e) => upd({ haramVotes: Number(e.target.value || 0) })}
          />
        </div>
      </div>
      {/* Remove */}
      <div className="flex justify-start mt-5">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"
        >
          Remove
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-3 text-xs">
      {/* Top row: name / status / reason */}
      <div className="grid gap-2 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-600">Name</label>
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Ingredient name"
            value={x.name}
            onChange={(e) => upd({ name: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-600">
            Status
          </label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            value={x.status}
            onChange={(e) => upd({ status: e.target.value })}
          >
            <option value="halal">halal</option>
            <option value="haram">haram</option>
            <option value="suspicious">suspicious</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-600">
            Reason
          </label>
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Short reason"
            value={x.reason}
            onChange={(e) => upd({ reason: e.target.value })}
          />
        </div>
      </div>

      {/* Second row: votes + users + remove */}
      {votesRow}
    </div>
  );
}
