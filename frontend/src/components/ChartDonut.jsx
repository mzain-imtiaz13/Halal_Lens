import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function ChartDonut({
  title,
  labels = [],
  values = [],
  colors,
  width = null,      // optional width
  height = 250       // optional height (default 250)
}) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: values,
        backgroundColor: colors || ['#22c55e', '#ef4444', '#f59e0b']
      }
    ]
  }

  const options = {
    responsive: !width,       // responsive if width isn't forced
    maintainAspectRatio: false
  }

  return (
    <div className="w-full rounded-2xl border border-brand-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      {title && (
        <div className="mb-2 text-sm font-semibold tracking-tight text-slate-900">
          {title}
        </div>
      )}

      <div
        style={{
          width: width ? width : "100%",
          height: height
        }}
      >
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}
