import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!loading && !isAdmin)
    return <Navigate to="/unauthorized" replace state={{ from: location }} />

  // IMPORTANT: render nested routes via Outlet
  return <Outlet />
}
