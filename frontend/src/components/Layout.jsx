import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NavItem from './NavItem'
import logo from '../assets/Halal_lens_logo.png' 

export default function Layout(){
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        {/* Brand area with your logo */}
        <div className="brand">
          <img src={logo} alt="Halal Lens" className="brand-logo" />
        </div>

        <NavItem to="/" label="Dashboard" icon={
          <svg viewBox="0 0 24 24"><path d="M3 12h7V3H3v9zm0 9h7v-7H3v7zm11 0h7v-9h-7v9zm0-18v7h7V3h-7z" fill="currentColor"/></svg>
        } />

        <div className="nav-section-title">Management</div>
        <NavItem to="/users" label="Users" icon={
          <svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" fill="currentColor"/></svg>
        } />
        <NavItem to="/products/ai" label="AI Products" icon={
          <svg viewBox="0 0 24 24"><path d="M12 2l9 4.9v9.1L12 22l-9-6.9V6.9L12 2zm0 2.2L5 7v6l7 5.3L19 13V7l-7-2.8z" fill="currentColor"/></svg>
        } />
        <NavItem to="/votes" label="Community Votes " icon={
          <svg viewBox="0 0 24 24"><path d="M12 21l-8-6 8-6 8 6-8 6zm0-12l-8-6 8-6 8 6-8 6z" fill="currentColor"/></svg>
        } />
        <NavItem to="/votes/summary" label="Votes Summary" icon={
          <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm10 8h8V3h-8v18z" fill="currentColor"/></svg>
        } />
        <NavItem to="/revenue" label="Revenue" icon={
          <svg viewBox="0 0 24 24"><path d="M3 17h2v4H3v-4zm4-6h2v10H7V11zm4-4h2v14h-2V7zm4 8h2v6h-2v-6zm4-12h2v18h-2V3z" fill="currentColor"/></svg>
        } />
        <NavItem to="/shops" label="Shops & Products" icon={
          <svg viewBox="0 0 24 24"><path d="M4 4h16v6H4zM3 12h18v8H3z" fill="currentColor"/></svg>
        } />
        <NavItem to="/products/manual" label="Manual Products" icon={
          <svg viewBox="0 0 24 24"><path d="M4 4h12v2H4v12h12v2H2V2h14v2H4zM12 12l6 6 4-10-10 4z" fill="currentColor"/></svg>
        } />
      </aside>

      <div>
        <header className="header">
          <div className="search" style={{maxWidth: 520}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18zm11 3-6-6"/></svg>
            <input placeholder="Search products, users, ingredients..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <div className="top-actions">
            <span style={{color:'#64748b', fontSize:14}}>{user?.email}</span>
            <button className="btn primary" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
