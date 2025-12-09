import React from "react";
import Button from "./Button";

export default function Toolbar({
  title,
  children,
  onReset,
  rightSlot,
  className = "",
}) {
  return (
    <div
      className={`w-full mb-4 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm ${className}`}
    >
      {/* Top row: title + optional right actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {title && (
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        )}

        {rightSlot && (
          <div className="flex flex-wrap items-center gap-2">{rightSlot}</div>
        )}
      </div>

      {/* Filters row: children + Reset */}
      {(children || onReset) && (
        <div className="mt-3 flex flex-col gap-2">
          {children && (
            <div className="flex items-center gap-2">{children}</div>
          )}

          {onReset && (
            <div>
              <Button
                variant="secondary"
                type="button"
                onClick={onReset}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
