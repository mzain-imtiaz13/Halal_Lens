// components/shops/StatusBadge.jsx

export default function StatusBadge({ value }) {
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
