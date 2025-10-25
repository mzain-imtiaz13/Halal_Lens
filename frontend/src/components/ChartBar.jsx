import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ChartBar({ title, labels=[], seriesA=[], seriesB=[], labelA='Scans', labelB='Users' }){
  const data = {
    labels,
    datasets: [
      { label: labelA, data: seriesA, backgroundColor:'#16a34a' },
      { label: labelB, data: seriesB, backgroundColor:'#7c3aed' }
    ]
  }
  const opts = {
    responsive:true,
    plugins:{ legend:{ position:'bottom' } },
    scales:{ y:{ beginAtZero:true } }
  }
  return (
    <div className="card">
      {title && <div style={{fontWeight:700, marginBottom:10}}>{title}</div>}
      <Bar data={data} options={opts} />
    </div>
  )
}
