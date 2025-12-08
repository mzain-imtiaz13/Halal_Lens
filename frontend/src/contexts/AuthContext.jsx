import React, { createContext, useContext, useEffect, useState } from "react";
import { appleProvider, auth, googleProvider } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

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
  FiTrash2,
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
        { to: "/dashboard/users", label: "Users & Subscriptions", icon: FiUsers },
        { to: "/dashboard/products/ai", label: "AI Products", icon: FiCpu },
        {
          to: "/dashboard/votes/summary",
          label: "Community Votes",
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
        }
      ];
    }

    // Normal user
    return [
      { to: "/dashboard/welcome", label: "Welcome", icon: FiSmile },
      {
        to: "/dashboard/subscriptions",
        label: "Subscriptions",
        icon: FiBarChart2,
      }
    ];
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);

      // Not logged in at all
      if (!u) {
        setUser(null); // ✅ clear user
        setRole("user");
        setIsAdmin(false);
        setSidebarLinks([]);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          toast.error(
            "Your account is not enabled yet. Please contact support or sign up through the Halal Lens Mobile App.",
            {
              position: "top-right",
              autoClose: 5000,
            }
          );

          await signOut(auth);
          setUser(null); // ✅ ensure cleared
          setRole("user");
          setIsAdmin(false);
          setSidebarLinks([]);
          setLoading(false);
          return;
        }

        // ✅ Existing Firestore user – allow login
        const data = snap.data() || {};
        const userRole = data.role || "user";

        const updates = {};
        if (!data.email && u.email) updates.email = u.email;
        if (!data.role) updates.role = userRole;
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(ref, updates);
        }

        setUser(u); // 🔥 this was missing
        setRole(userRole);
        setIsAdmin(userRole === "admin");
        setSidebarLinks(buildSidebarLinks(userRole));
      } catch (err) {
        console.error("[AuthProvider] User role check failed:", err);
        setUser(null); // ✅ fail-safe
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

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  const loginWithApple = async () => {
    try {
      // For Apple, popup works only on desktop. Use redirect fallback.
      return await signInWithPopup(auth, appleProvider);
    } catch (err) {
      console.warn("Popup failed, using redirect...");
      return await signInWithRedirect(auth, appleProvider);
    }
  };

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
        loginWithGoogle,
        loginWithApple,
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
