import React, { useEffect, useState } from "react";
import {
  listShops,
  createShop,
  updateShop,
  deleteShop,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../api/services/shops";
import Modal from "../components/Modal";
 // keep if you still use global vars like --bg, etc.

// ===== Core Firestore Models =====

// // shops collection
// export interface Shop {
//   id: string;            // Firestore doc id
//   name: string;
//   address?: string;
//   // optional denormalized products if you want
//   productsCount?: number;
// }

// // shops/{shopId}/products subcollection
// export interface Product {
//   id: string;            // Firestore doc id
//   shopId: string;        // parent shop id (for easy querying)

//   // core
//   name: string;          // productName in form
//   barcode?: string;
//   brands?: string;       // brands field
//   quantity?: string;

//   // status & flags
//   overallStatus?: "halal" | "haram" | "suspicious" | "";
//   statusReason?: string;
//   isVerified: boolean;   // (or verified)

//   // images (store URL or base64, your choice)
//   frontImage?: string;
//   backImage?: string;

//   // tags/meta
//   categories: string[];
//   allergens: string[];
//   additives: string[];
//   nutriscore?: string;

//   // nutriments (dynamic keys)
//   nutriments?: Nutriments;

//   // nested arrays
//   ingredients: Ingredient[];
//   references: Reference[];

//   // timestamps
//   createdAt: FirebaseFirestore.Timestamp;
//   updatedAt: FirebaseFirestore.Timestamp;
// }

// // ===== Nested Value Objects =====

// export interface Ingredient {
//   name: string;
//   status: "halal" | "haram" | "suspicious";
//   reason: string;

//   halalVotes: number;
//   suspiciousVotes: number;
//   haramVotes: number;

//   votedUserIds: string[];  // user ids who already voted
// }

// export interface Reference {
//   title: string;
//   url: string;
//   notes: string;
// }

// // key-value nutriments (energy-kcal_100g → number/string)
// export type Nutriments = {
//   [key: string]: number | string;
// };



/* ========= Helpers ========= */
const readAsDataURL = (file) =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

/* ========= Simple badges ========= */
function StatusBadge({ value }) {
  let base =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ";
  let dot = "h-1.5 w-1.5 rounded-full ";

  if (value === "halal") {
    base += "border-brand-200 bg-brand-50 text-brand-700";
    dot += "bg-brand-500";
  } else if (value === "haram") {
    base += "border-red-200 bg-red-50 text-red-700";
    dot += "bg-red-500";
  } else if (value === "suspicious") {
    base += "border-amber-200 bg-amber-50 text-amber-700";
    dot += "bg-amber-500";
  } else {
    base += "border-slate-200 bg-slate-50 text-slate-600";
    dot += "bg-slate-400";
  }

  return (
    <span className={base}>
      <span className={dot} />
      {value || "-"}
    </span>
  );
}

/* ========= Shop Form ========= */
function ShopForm({ initial = { name: "", address: "" }, onCancel, onSave, saving }) {
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
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Al-Noor Mart"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Address</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
          className="inline-flex items-center rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ========= Ingredient Row ========= */
const makeEmptyIngredient = () => ({
  name: "",
  status: "suspicious",
  reason: "",
  halalVotes: 0,
  suspiciousVotes: 0,
  haramVotes: 0,
  votedUserIds: [],
});

function IngredientRow({ value, onChange, onRemove }) {
  const [x, setX] = useState(value || makeEmptyIngredient());

  useEffect(() => {
    setX(value || makeEmptyIngredient());
  }, [value]);

  const upd = (patch) => {
    const n = { ...x, ...patch };
    setX(n);
    onChange(n);
  };

  return (
    <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs md:grid-cols-[1.1fr,0.9fr,1.3fr,0.6fr,0.6fr,0.6fr,1.4fr,auto]">
      <input
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Name"
        value={x.name}
        onChange={(e) => upd({ name: e.target.value })}
      />
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        value={x.status}
        onChange={(e) => upd({ status: e.target.value })}
      >
        <option value="halal">halal</option>
        <option value="haram">haram</option>
        <option value="suspicious">suspicious</option>
      </select>
      <input
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Reason"
        value={x.reason}
        onChange={(e) => upd({ reason: e.target.value })}
      />
      <input
        type="number"
        min="0"
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        value={x.halalVotes}
        onChange={(e) =>
          upd({ halalVotes: Number(e.target.value || 0) })
        }
      />
      <input
        type="number"
        min="0"
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        value={x.suspiciousVotes}
        onChange={(e) =>
          upd({ suspiciousVotes: Number(e.target.value || 0) })
        }
      />
      <input
        type="number"
        min="0"
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        value={x.haramVotes}
        onChange={(e) =>
          upd({ haramVotes: Number(e.target.value || 0) })
        }
      />
      <input
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="user1, user2"
        value={(x.votedUserIds || []).join(", ")}
        onChange={(e) =>
          upd({
            votedUserIds: e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
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

/* ========= Reference Row ========= */
const makeEmptyRef = () => ({ title: "", url: "", notes: "" });

function ReferenceRow({ value, onChange, onRemove }) {
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

/* ========= Tag Input ========= */
function TagInput({ value = [], onChange, placeholder }) {
  const [text, setText] = useState("");

  const addToken = (raw) => {
    const parts = String(raw || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parts.length) return;
    const set = new Set([...(value || [])]);
    parts.forEach((p) => set.add(p));
    onChange(Array.from(set));
  };

  const addFromText = () => {
    if (!text.trim()) return;
    addToken(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      addFromText();
    }
    if (e.key === "Backspace" && !text && (value || []).length) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (i) =>
    onChange((value || []).filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1">
      {(value || []).map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
        >
          {t}
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-slate-500 hover:text-slate-700"
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] border-0 bg-transparent px-1 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addFromText}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ========= Nutriment Row ========= */
const makeEmptyNutri = () => ({ key: "", value: "" });

function NutrimentRow({ value, onChange, onRemove }) {
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

/* ========= Product Form ========= */
function ProductForm({ initial = {}, onCancel, onSave, saving }) {
  // core
  const [productName, setProductName] = useState(
    initial.productName || initial.name || ""
  );
  const [barcode, setBarcode] = useState(initial.barcode || "");
  const [brands, setBrands] = useState(initial.brands || initial.brand || "");

  // status & flags
  const [overallStatus, setOverallStatus] = useState(
    initial.overallStatus || ""
  );
  const [statusReason, setStatusReason] = useState(
    initial.statusReason || ""
  );
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
  const rmIng = (idx) =>
    setIngredients((p) => p.filter((_, i) => i !== idx));

  // references
  const [references, setReferences] = useState(
    Array.isArray(initial.references) ? initial.references : []
  );
  const addRef = () => setReferences((p) => [...p, makeEmptyRef()]);
  const updRef = (idx, val) =>
    setReferences((p) => p.map((r, i) => (i === idx ? val : r)));
  const rmRef = (idx) =>
    setReferences((p) => p.filter((_, i) => i !== idx));

  const toNutriObject = (rows) => {
    const o = {};
    rows.forEach((r) => {
      const k = (r.key || "").trim();
      if (!k) return;
      const n = Number(r.value);
      o[k] = isNaN(n) ? r.value : n;
    });
    return Object.keys(o).length ? o : null;
  };

  const handleSave = (e) => {
    e?.preventDefault();
    onSave({
      productName,
      barcode,
      brands,
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
            <label className="text-xs font-medium text-slate-700">
              Brands
            </label>
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
        <h4 className="text-sm font-semibold text-slate-800">Ingredients</h4>
        <div className="hidden text-[11px] text-slate-500 md:grid md:grid-cols-[1.1fr,0.9fr,1.3fr,0.6fr,0.6fr,0.6fr,1.4fr,auto] md:gap-2 md:border-b md:border-slate-200 md:pb-1">
          <div>Name</div>
          <div>Status</div>
          <div>Reason</div>
          <div className="text-right">Halal</div>
          <div className="text-right">Susp.</div>
          <div className="text-right">Haram</div>
          <div>Voted User IDs</div>
          <div className="text-right">Action</div>
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
        <button
          type="button"
          onClick={addIng}
          className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
        >
          + Add ingredient
        </button>
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
        <button
          type="button"
          onClick={addNutriRow}
          className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
        >
          + Add nutriment
        </button>
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
            <label className="text-xs font-medium text-slate-700">
              Reason
            </label>
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
        <button
          type="button"
          onClick={addRef}
          className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
        >
          + Add reference
        </button>
      </section>

      {/* Actions */}
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
          className="inline-flex items-center rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save product"}
        </button>
      </div>
    </form>
  );
}

/* ========= Page: Shops ========= */
export default function Shops() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // shop modals
  const [createShopOpen, setCreateShopOpen] = useState(false);
  const [editShop, setEditShop] = useState(null);
  const [savingShop, setSavingShop] = useState(false);

  // product modals
  const [addProductForShop, setAddProductForShop] = useState(null);
  const [editProductContext, setEditProductContext] = useState(null); // { shopId, product }
  const [savingProduct, setSavingProduct] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await listShops({});
      setRows(resp.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* --- Shop handlers --- */
  const handleCreateShop = async (data) => {
    setSavingShop(true);
    try {
      await createShop(data);
      setCreateShopOpen(false);
      await fetchData();
    } finally {
      setSavingShop(false);
    }
  };

  const handleUpdateShop = async (shopId, data) => {
    setSavingShop(true);
    try {
      await updateShop(shopId, data);
      setEditShop(null);
      await fetchData();
    } finally {
      setSavingShop(false);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm("Delete this shop?")) return;
    await deleteShop(shopId);
    await fetchData();
  };

  /* --- Product handlers --- */
  const handleAddProduct = async (shopId, payload) => {
    setSavingProduct(true);
    try {
      await addProduct(shopId, payload);
      setAddProductForShop(null);
      await fetchData();
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateProduct = async (shopId, productId, payload) => {
    setSavingProduct(true);
    try {
      await updateProduct(shopId, productId, payload);
      setEditProductContext(null);
      await fetchData();
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (shopId, productId) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(shopId, productId);
    await fetchData();
  };

  const ImgThumb = ({ src }) =>
    src ? (
      <img
        src={src}
        alt=""
        className="h-12 w-16 rounded-md border border-slate-200 object-cover"
      />
    ) : (
      <span className="text-xs text-slate-400">—</span>
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Shops &amp; Products
          </h2>
          <p className="text-sm text-slate-500">
            Manage your verified shops and the products they sell.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateShopOpen(true)}
          className="inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          + Add Shop
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center text-sm text-slate-500">
          No shops yet. Click{" "}
          <span className="font-semibold text-slate-700">“Add Shop”</span> to
          create your first one.
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((shop) => (
            <div
              key={shop.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {/* Shop header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {shop.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {shop.address || "No address"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setEditShop(shop)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setAddProductForShop(shop)}
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"
                    onClick={() => handleDeleteShop(shop.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Products */}
              <div className="mt-3 flex-1">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Products
                </div>

                {shop.products?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                          <th className="border-b border-slate-200 px-2 py-2">
                            Picture
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Product
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Barcode
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Brands
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Status
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Verified
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shop.products.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-slate-100 hover:bg-slate-50/70"
                          >
                            <td className="px-2 py-2 align-middle">
                              <ImgThumb
                                src={p.frontImage || p.picture || ""}
                              />
                            </td>
                            <td className="px-2 py-2 align-middle text-slate-800">
                              {p.name}
                            </td>
                            <td className="px-2 py-2 align-middle text-slate-700">
                              {p.barcode || "-"}
                            </td>
                            <td className="px-2 py-2 align-middle text-slate-700">
                              {p.brand || p.brands || "-"}
                            </td>
                            <td className="px-2 py-2 align-middle">
                              <StatusBadge value={p.overallStatus} />
                            </td>
                            <td className="px-2 py-2 align-middle">
                              <StatusBadge
                                value={p.verified ? "Yes" : "No"}
                              />
                            </td>
                            <td className="px-2 py-2 align-middle text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                                  onClick={() =>
                                    setEditProductContext({
                                      shopId: shop.id,
                                      product: p,
                                    })
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"
                                  onClick={() =>
                                    handleDeleteProduct(shop.id, p.id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-xs text-slate-500">
                    No products yet. Click{" "}
                    <span className="font-semibold text-slate-700">
                      “Add Product”
                    </span>{" "}
                    to create one.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === Modals === */}

      {/* Create shop */}
      <Modal isOpen={createShopOpen} onClose={() => setCreateShopOpen(false)}>
        <ShopForm
          onCancel={() => setCreateShopOpen(false)}
          onSave={handleCreateShop}
          saving={savingShop}
        />
      </Modal>

      {/* Edit shop */}
      <Modal isOpen={!!editShop} onClose={() => setEditShop(null)}>
        {editShop && (
          <ShopForm
            initial={editShop}
            onCancel={() => setEditShop(null)}
            onSave={(data) => handleUpdateShop(editShop.id, data)}
            saving={savingShop}
          />
        )}
      </Modal>

      {/* Add product */}
      <Modal
        isOpen={!!addProductForShop}
        onClose={() => setAddProductForShop(null)}
      >
        {addProductForShop && (
          <ProductForm
            onCancel={() => setAddProductForShop(null)}
            onSave={(data) => handleAddProduct(addProductForShop.id, data)}
            saving={savingProduct}
          />
        )}
      </Modal>

      {/* Edit product */}
      <Modal
        isOpen={!!editProductContext}
        onClose={() => setEditProductContext(null)}
      >
        {editProductContext && (
          <ProductForm
            initial={{
              ...editProductContext.product,
              productName: editProductContext.product.name,
              brands:
                editProductContext.product.brand ||
                editProductContext.product.brands ||
                "",
              frontImageUrl:
                editProductContext.product.frontImage ||
                editProductContext.product.picture ||
                "",
              backImageUrl: editProductContext.product.backImage || "",
              overallStatus:
                editProductContext.product.overallStatus || "",
              isVerified: editProductContext.product.verified,
            }}
            onCancel={() => setEditProductContext(null)}
            onSave={(data) =>
              handleUpdateProduct(
                editProductContext.shopId,
                editProductContext.product.id,
                data
              )
            }
            saving={savingProduct}
          />
        )}
      </Modal>
    </div>
  );
}
