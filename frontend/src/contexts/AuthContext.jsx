import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// 🔹 Sidebar icons
import {
  FiHome,
  FiUsers,
  FiCpu,
  FiLayers,
  FiTrendingUp,
  FiBarChart2,
  FiShoppingBag,
  FiEdit3,
  FiSmile,
} from "react-icons/fi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("user"); // "user" | "admin" | ...
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarLinks, setSidebarLinks] = useState([]); // 🔹 sidebar links live here
  const navigate = useNavigate();

  // Helper to build sidebar links based on role
  const buildSidebarLinks = (roleValue) => {
    if (roleValue === "admin") {
      return [
        { to: "/dashboard/welcome", label: "Welcome", icon: FiSmile },
        { to: "/dashboard/admin", label: "Dashboard", icon: FiHome },
        { to: "/dashboard/users", label: "Users", icon: FiUsers },
        { to: "/dashboard/products/ai", label: "AI Products", icon: FiCpu },
        { to: "/dashboard/votes", label: "Community Votes", icon: FiLayers },
        {
          to: "/dashboard/votes/summary",
          label: "Votes Summary",
          icon: FiBarChart2,
        },
        { to: "/dashboard/revenue", label: "Revenue", icon: FiTrendingUp },
        {
          to: "/dashboard/shops",
          label: "Shops & Products",
          icon: FiShoppingBag,
        },
        {
          to: "/dashboard/products/manual",
          label: "Manual Products",
          icon: FiEdit3,
        },
      ];
    }

    // Normal user
    return [
      { to: "/dashboard/welcome", label: "Welcome", icon: FiSmile },
      {
        to: "/dashboard/subscriptions",
        label: "Subscriptions",
        icon: FiBarChart2,
      },
    ];
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);

      // Not logged in
      if (!u) {
        setRole("user");
        setIsAdmin(false);
        setSidebarLinks([]); // no sidebar when not logged in
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // First time login: create a user doc with default role "user"
          const baseData = {
            email: u.email || "",
            role: "user",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          await setDoc(ref, baseData, { merge: true });
          setRole("user");
          setIsAdmin(false);
          setSidebarLinks(buildSidebarLinks("user"));
        } else {
          const data = snap.data() || {};

          // Get role, default to "user" if missing
          const userRole = data.role || "user";

          // Optional: backfill missing fields
          const updates = {};
          if (!data.email && u.email) updates.email = u.email;
          if (!data.role) updates.role = userRole;
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = serverTimestamp();
            await updateDoc(ref, updates);
          }

          setRole(userRole);
          setIsAdmin(userRole === "admin");
          setSidebarLinks(buildSidebarLinks(userRole));
        }
      } catch (err) {
        console.error("[AuthProvider] User role check failed:", err);
        // Fail-safe: treat as normal user
        setRole("user");
        setIsAdmin(false);
        setSidebarLinks([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    try {
      await signOut(auth);
      setSidebarLinks([]); // clear links on logout
      toast.success("You have been logged out successfully.", {
        position: "top-right",
        autoClose: 5000,
        style: {
          backgroundColor: "#16a34a",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "8px",
          padding: "16px",
        },
      });
      navigate("/login", { state: { loggedOut: true } });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAdmin,
        sidebarLinks,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
