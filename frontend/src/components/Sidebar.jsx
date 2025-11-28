// src/components/Sidebar.jsx
import React from 'react'
import NavItem from './NavItem'
import logo from '../assets/Halal_lens_logo.png'

import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiUsers,
  FiCpu,
  FiLayers,
  FiTrendingUp,
  FiBarChart2,
  FiShoppingBag,
  FiEdit3,
} from 'react-icons/fi'

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="btn sidebar-toggle fancy"
        aria-label="Toggle sidebar"
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
      </button>

      <div className="side-sep" />

      <nav className="nav">
        <NavItem
          to="/dashboard"
          label="Dashboard"
          icon={<FiHome />}
          collapsed={collapsed}
        />

        <div className="side-sep" />

        <div className="nav-section-title">
          {!collapsed ? 'Management' : ''}
        </div>

        <NavItem
          to="/users"
          label="Users"
          icon={<FiUsers />}
          collapsed={collapsed}
        />

        <NavItem
          to="/products/ai"
          label="AI Products"
          icon={<FiCpu />}
          collapsed={collapsed}
        />

        <NavItem
          to="/votes"
          label="Community Votes"
          icon={<FiLayers />}
          collapsed={collapsed}
        />

        <NavItem
          to="/votes/summary"
          label="Votes Summary"
          icon={<FiBarChart2 />}
          collapsed={collapsed}
        />

        <NavItem
          to="/revenue"
          label="Revenue"
          icon={<FiTrendingUp />}
          collapsed={collapsed}
        />

        <NavItem
          to="/shops"
          label="Shops & Products"
          icon={<FiShoppingBag />}
          collapsed={collapsed}
        />

        <NavItem
          to="/products/manual"
          label="Manual Products"
          icon={<FiEdit3 />}
          collapsed={collapsed}
        />
      </nav>
    </aside>
  )
}
