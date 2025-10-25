import React from 'react'

export default function StatCard({ label, value, delta, deltaType='up', icon }){
  return (
    <div className="card">
      <div className="kpi">
        <div className="icon" style={{background:'#ecfdf3', color:'#166534'}}>
          {icon || <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 12h5V3H3v9zm6 9h5V3h-5v18zm6-6h5V3h-5v12z"/></svg>}
        </div>
        <div>
          <div className="meta">{label}</div>
          <div className="value">{value}</div>
          {delta != null && (
            <div className="meta" style={{marginTop:4}}>
              <span className={`badge ${deltaType==='down'?'danger':'ok'}`}>
                {deltaType==='down' ? '▼' : '▲'} {delta}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
