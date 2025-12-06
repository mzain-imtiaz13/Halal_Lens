import React from 'react'

export default function StatCard({ label, value, delta, deltaType = 'up', icon }) {
  const isDown = deltaType === 'down'

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--panel) p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon || (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3 12h5V3H3v9zm6 9h5V3h-5v18zm6-6h5V3h-5v12z"
              />
            </svg>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className="text-2xl font-semibold leading-tight text-slate-900">
            {value}
          </div>

          {delta != null && (
            <div className="mt-1">
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  isDown
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                <span className="text-[10px]">
                  {isDown ? "▼" : "▲"}
                </span>
                <span>{delta}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
