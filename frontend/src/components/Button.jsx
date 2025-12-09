import React from "react";

export default function Button({
  children,
  variant = "primary",
  rounded = false,
  outline = false,
  isLoading = false,
  disabled = false,
  className = "",
  ...rest
}) {
  let base = "inline-flex items-center justify-center text-sm font-medium transition-all cursor-pointer ";

  // spacing only if not link
  if (variant !== "link") base += " px-3 py-1.5";

  // shape
  base += rounded ? " rounded-full" : " rounded-md";

  // ---- COLOR VARIANTS ----
  const variants = {
    primary: outline
      ? "border border-brand-600 text-brand-600 bg-white hover:bg-brand-50"
      : "bg-brand-600 text-white hover:bg-brand-700 border border-brand-600",

    secondary: outline
      ? "border border-slate-400 text-slate-700 bg-white hover:bg-slate-50"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300",

    success: outline
      ? "border border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50"
      : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600",

    warning: outline
      ? "border border-amber-500 text-amber-600 bg-white hover:bg-amber-50"
      : "bg-amber-500 text-white hover:bg-amber-600 border border-amber-500",

    danger: outline
      ? "border border-red-300 text-red-600 bg-white hover:bg-red-50"
      : "bg-red-600 text-white hover:bg-red-700 border border-red-600",

    link: "text-brand-600 underline px-1 py-1 hover:text-brand-700 bg-transparent border-none"
  };

  base += " " + (variants[variant] || variants.primary);

  // Disabled / Loading
  if (disabled || isLoading) {
    base += " opacity-50 cursor-not-allowed";
  }

  // Merge custom className
  if (className) base += " " + className;

  return (
    <button {...rest} className={base.trim()} disabled={disabled || isLoading}>
      {isLoading ? "Loading…" : children}
    </button>
  );
}
