import React from 'react'

export default function Toolbar({ title, left, right, children, onReset }){
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {title && <h2 style={{margin:'0 8px 0 0'}}>{title}</h2>}
        {left || children}
      </div>
      <div className="toolbar-right">
        {onReset && <button className="btn ghost" onClick={onReset}>Reset</button>}
        {right}
      </div>
    </div>
  )
}
