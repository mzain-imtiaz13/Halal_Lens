import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavItem({ to, label, icon }){
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
      {icon || <span style={{width:18}} />}
      <span>{label}</span>
    </NavLink>
  )
}
