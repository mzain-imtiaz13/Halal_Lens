import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import ProductsAI from './pages/ProductsAI'
import ProductsManual from './pages/ProductsManual'
import Votes from './pages/Votes'
import VotesSummary from './pages/VotesSummary'
import Revenue from './pages/Revenue'
import Shops from './pages/Shops'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'
import DataDeletion from './pages/DataDeletion'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/data-deletion" element={<DataDeletion />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/products/ai" element={<ProductsAI />} />
        <Route path="/products/manual" element={<ProductsManual />} />
        <Route path="/votes" element={<Votes />} />
        <Route path="/votes/summary" element={<VotesSummary />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/shops" element={<Shops />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
