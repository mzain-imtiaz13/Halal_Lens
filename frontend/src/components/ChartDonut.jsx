import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

export default function ChartDonut({ title, labels = [], values = [], colors }){
  const data = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: values,
        backgroundColor: colors || ['#22c55e','#ef4444','#f59e0b']
      }
    ]
  }
  return (
    <div className="card">
      {title && <div style={{fontWeight:700, marginBottom:10}}>{title}</div>}
      <Doughnut data={data} />
    </div>
  )
}
