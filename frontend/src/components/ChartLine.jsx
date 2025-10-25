import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function ChartLine({ title, labels=[], series=[], label='Revenue' }){
  const data = {
    labels,
    datasets: [
      {
        label,
        data: series,
        borderColor:'#16a34a',
        backgroundColor:'rgba(22,163,74,0.15)',
        tension:.3,
        fill:true
      }
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
      <Line data={data} options={opts} />
    </div>
  )
}
