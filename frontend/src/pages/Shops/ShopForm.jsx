// components/shops/ShopForm.jsx
import React, { useState } from "react";

export default function ShopForm({
  initial = { name: "", address: "" },
  onCancel,
  onSave,
  saving,
}) {
  const [name, setName] = useState(initial.name || "");
  const [address, setAddress] = useState(initial.address || "");

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave({ name: name.trim(), address: address.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {initial?.id ? "Edit Shop" : "Add Shop"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Manage your Halal Lens partner shops.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Shop name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Al-Noor Mart"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Address</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, City"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
