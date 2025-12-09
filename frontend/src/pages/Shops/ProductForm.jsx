// components/shops/ProductForm.jsx
import React, { useState } from "react";
import { readAsDataURL } from "../../utils/fileUtils";
import TagInput from "./TagInput";
import IngredientRow, { makeEmptyIngredient } from "./IngredientRow";
import NutrimentRow, { makeEmptyNutri } from "./NutrimentRow";
import ReferenceRow, { makeEmptyRef } from "./ReferenceRow";
import Button from "../../components/Button";

function toNutriObject(rows) {
  const o = {};
  rows.forEach((r) => {
    const k = (r.key || "").trim();
    if (!k) return;
    const n = Number(r.value);
    o[k] = isNaN(n) ? r.value : n;
  });
  return Object.keys(o).length ? o : null;
}

export default function ProductForm({
  initial = {},
  onCancel,
  onSave,
  saving,
}) {
  console.log(initial);
  // core
  const [productName, setProductName] = useState(
    initial.productName || initial.name || ""
  );
  const [barcode, setBarcode] = useState(initial.barcode || "");
  const [origin, setOrigin] = useState(initial.origin || "");
  const [brands, setBrands] = useState(initial.brands || initial.brand || "");

  // status & flags
  const [overallStatus, setOverallStatus] = useState(
    initial.overallStatus || ""
  );
  const [statusReason, setStatusReason] = useState(initial.statusReason || "");
  const [isVerified, setIsVerified] = useState(
    !!initial.isVerified || !!initial.verified
  );

  // images
  const [frontImage, setFrontImage] = useState(
    initial.frontImageUrl || initial.frontImage || initial.picture || ""
  );
  const [backImage, setBackImage] = useState(
    initial.backImageUrl || initial.backImage || ""
  );

  const onPickFront = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFrontImage(await readAsDataURL(f));
  };
  const onPickBack = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBackImage(await readAsDataURL(f));
  };

  // optional/meta
  const [quantity, setQuantity] = useState(initial.quantity || "");
  const [categories, setCategories] = useState(
    Array.isArray(initial.categories)
      ? initial.categories
      : initial.category
      ? [initial.category]
      : []
  );
  const [allergens, setAllergens] = useState(
    Array.isArray(initial.allergens) ? initial.allergens : []
  );
  const [additives, setAdditives] = useState(
    Array.isArray(initial.additives) ? initial.additives : []
  );
  const [nutriscore, setNutriscore] = useState(initial.nutriscore || "");

  // nutriments
  const initRows = [];
  if (initial.nutriments && typeof initial.nutriments === "object") {
    Object.entries(initial.nutriments).forEach(([k, v]) => {
      initRows.push({ key: k, value: String(v) });
    });
  }
  const [nutrimentsRows, setNutrimentsRows] = useState(
    initRows.length ? initRows : [makeEmptyNutri()]
  );
  const addNutriRow = () => setNutrimentsRows((p) => [...p, makeEmptyNutri()]);
  const updNutriRow = (idx, val) =>
    setNutrimentsRows((p) => p.map((it, i) => (i === idx ? val : it)));
  const rmNutriRow = (idx) =>
    setNutrimentsRows((p) => p.filter((_, i) => i !== idx));

  // ingredients
  const [ingredients, setIngredients] = useState(
    Array.isArray(initial.ingredients) && initial.ingredients.length
      ? initial.ingredients
      : [makeEmptyIngredient()]
  );
  const addIng = () => setIngredients((p) => [...p, makeEmptyIngredient()]);
  const updIng = (idx, val) =>
    setIngredients((p) => p.map((it, i) => (i === idx ? val : it)));
  const rmIng = (idx) => setIngredients((p) => p.filter((_, i) => i !== idx));

  // references
  const [references, setReferences] = useState(
    Array.isArray(initial.references) ? initial.references : []
  );
  const addRef = () => setReferences((p) => [...p, makeEmptyRef()]);
  const updRef = (idx, val) =>
    setReferences((p) => p.map((r, i) => (i === idx ? val : r)));
  const rmRef = (idx) => setReferences((p) => p.filter((_, i) => i !== idx));

  const handleSave = (e) => {
    e?.preventDefault();
    onSave({
      productName,
      barcode,
      brands,
      origin,
      overallStatus: (overallStatus || "").trim(),
      statusReason: (statusReason || "").trim(),
      isVerified,
      frontImage,
      backImage,
      quantity: (quantity || "").trim(),
      categories,
      allergens,
      additives,
      nutriscore: (nutriscore || "").trim(),
      nutriments: toNutriObject(nutrimentsRows),
      ingredients,
      references,
    });
  };

  return (
    <form
      onSubmit={handleSave}
      className="max-h-[70vh] space-y-6 overflow-y-auto pr-1"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {initial?.id ? "Edit Product" : "Add Product"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Add or update a product linked to this shop.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h4 className="text-sm font-semibold text-slate-800">Overview</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Product name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Prince Goût Chocolat"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Barcode
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="7622210449283"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Origin</label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Canada"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Brands</label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={brands}
              onChange={(e) => setBrands(e.target.value)}
              placeholder="Lu"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Quantity
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="300 g"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-slate-800">Images</h4>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            Upload Front
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFront}
            />
          </label>
          {frontImage ? (
            <img
              src={frontImage}
              alt="front"
              className="h-16 w-20 rounded-md border border-slate-200 object-cover"
            />
          ) : (
            <span className="text-xs text-slate-500">No front image</span>
          )}

          <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            Upload Back
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickBack}
            />
          </label>
          {backImage ? (
            <img
              src={backImage}
              alt="back"
              className="h-16 w-20 rounded-md border border-slate-200 object-cover"
            />
          ) : (
            <span className="text-xs text-slate-500">No back image</span>
          )}

          <label className="ml-auto flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
            />
            Verified
          </label>
        </div>
      </section>

      {/* Ingredients */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Ingredients
            </h4>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Set per-ingredient status and community votes.
            </p>
          </div>
          <div className="hidden text-right text-[11px] text-slate-500 md:flex md:flex-col">
            <span>Halal / Suspicious / Haram</span>
          </div>
        </div>

        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <IngredientRow
              key={idx}
              value={ing}
              onChange={(v) => updIng(idx, v)}
              onRemove={() => rmIng(idx)}
            />
          ))}
        </div>
        <Button variant="primary" type="button" onClick={addIng}>
          + Add ingredient
        </Button>
      </section>

      {/* Categories / Allergens / Additives */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-slate-800">
          Categories / Allergens / Additives
        </h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Categories
            </label>
            <TagInput
              value={categories}
              onChange={setCategories}
              placeholder="en:snacks, en:biscuits..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Allergens
            </label>
            <TagInput
              value={allergens}
              onChange={setAllergens}
              placeholder="eggs, gluten, milk..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Additives
            </label>
            <TagInput
              value={additives}
              onChange={setAdditives}
              placeholder="E100, E322..."
            />
          </div>
        </div>
      </section>

      {/* Nutriments */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-slate-800">Nutriments</h4>
        <div className="space-y-2">
          {nutrimentsRows.map((row, idx) => (
            <NutrimentRow
              key={idx}
              value={row}
              onChange={(v) => updNutriRow(idx, v)}
              onRemove={() => rmNutriRow(idx)}
            />
          ))}
        </div>
        <Button variant="secondary" type="button" onClick={addNutriRow}>
          + Add nutriment
        </Button>
      </section>

      {/* Verdict */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-slate-800">Verdict</h4>
        <div className="grid gap-3 sm:grid-cols-[0.7fr,1.3fr]">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Overall Status
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={overallStatus}
              onChange={(e) => setOverallStatus(e.target.value)}
            >
              <option value="">—</option>
              <option value="halal">halal</option>
              <option value="haram">haram</option>
              <option value="suspicious">suspicious</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Reason</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </section>

      {/* References */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-slate-800">References</h4>
        <div className="space-y-2">
          {references.map((r, idx) => (
            <ReferenceRow
              key={idx}
              value={r}
              onChange={(v) => updRef(idx, v)}
              onRemove={() => rmRef(idx)}
            />
          ))}
        </div>
        <Button variant="secondary" type="button" onClick={addRef}>
          + Add reference
        </Button>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
}
