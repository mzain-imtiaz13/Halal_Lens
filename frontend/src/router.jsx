import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ProductsAI from "./pages/ProductsAI";
import ProductsManual from "./pages/ProductsManual";
import Votes from "./pages/Votes";
import VotesSummary from "./pages/VotesSummary";
import Revenue from "./pages/Revenue";
import Shops from "./pages/Shops";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import HalalLensLanding from "./pages/HalalLensLanding";
import StaticLayout from "./components/StaticLayout";
import About from "./pages/About";
import TermsOfService from "./pages/TermsOfService";
import Support from "./pages/Support";
import BillingSuccess from "./pages/Billing/BillingSuccess";
import BillingCancel from "./pages/Billing/BillingCancel";
import BillingPlans from "./pages/Billing/BillingPlans";
import UserLayout from "./components/UserLayout";
import BillingHistory from "./pages/Billing/BillingHistory";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<StaticLayout />}>
        <Route path="/" element={<HalalLensLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
      </Route>
      <Route element={<UserLayout />}>
        <Route path="/billing" element={<BillingPlans />} />
        <Route path="/subscriptions" element={<BillingHistory />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
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
  );
}
