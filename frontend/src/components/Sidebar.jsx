import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/** Single nav item */
const NavItem = ({ to, label, Icon, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {Icon ? <Icon size={18} /> : <span className="inline-block h-5 w-5" />}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ links = [] }) {
  const [collapsed, setCollapsed] = useState(false)

  const handleToggle = () => setCollapsed((prev) => !prev)

  return (
    <aside
      className={[
        // sticky left, full viewport height
        'sticky top-0 self-start',
        'border-r border-slate-200 bg-white',
        'px-2 pt-3 pb-4',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-20' : 'w-64',
        'shrink-0',
        'h-screen',
      ].join(' ')}
    >
      {/* Small collapsible button – top right */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Toggle sidebar"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-700"
      >
        {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
      </button>

      {/* Flat nav list */}
      <nav className="mt-10 space-y-1">
        {links.map((link) => (
          <NavItem
            key={link.to}
            to={link.to}
            label={link.label}
            Icon={link.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  )
}
