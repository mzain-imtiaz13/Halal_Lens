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
import BillingHistory from "./pages/Billing/BillingHistory";
import BusinessInfo from "./pages/BusinessInfo";
import Welcome from "./pages/Welcome";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<StaticLayout />}>
        <Route path="/" element={<HalalLensLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/scta" element={<BusinessInfo />} />
        <Route path="/support" element={<Support />} />
        <Route path="/billing" element={<BillingPlans />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Layout />}>
          {/* Authenticated (any role) */}
          <Route path="welcome" element={<Welcome />} />
          <Route path="subscriptions" element={<BillingHistory />} />
          <Route path="data-deletion" element={<DataDeletion />} />

          {/* Admin-only section */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="admin" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products/ai" element={<ProductsAI />} />
            <Route path="products/manual" element={<ProductsManual />} />
            <Route path="votes" element={<Votes />} />
            <Route path="votes/summary" element={<VotesSummary />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="shops" element={<Shops />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
