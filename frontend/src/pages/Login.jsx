import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "/Halal_lens_logo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";


export default function Login() {
  const { user, login, loginWithApple, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login"); // "login" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  // 🔹 Where we will redirect after login
  const [redirectTo, setRedirectTo] = useState("/dashboard/welcome");

  // 🔹 Read and sanitize returnUrl from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawReturnUrl = params.get("returnUrl");

    if (
      rawReturnUrl &&
      rawReturnUrl.startsWith("/") && // internal route
      !rawReturnUrl.startsWith("//") // avoid protocol-relative URLs
    ) {
      setRedirectTo(rawReturnUrl);
    } else {
      setRedirectTo("/dashboard/welcome");
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      // If already logged in, go to returnUrl or default
      navigate(redirectTo, { replace: true });
    }
    if (location.state?.loggedOut) {
      setInfo("You have been logged out.");
    }
  }, [user, navigate, location.state, redirectTo]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      // 🔹 After successful login, go to redirectTo
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email to reset your password.");
      return;
    }

    try {
      setResetting(true);
      await sendPasswordResetEmail(auth, trimmedEmail);
      setInfo("Password reset email sent successfully. Please check your inbox.");
      // Optionally switch back to login view after success
      setMode("login");
    } catch (err) {
      setError(err?.message || "Failed to send password reset email.");
    } finally {
      setResetting(false);
    }
  };

  const goToReset = () => {
    setMode("reset");
    setError("");
    setInfo("");
  };

  const goToLogin = () => {
    setMode("login");
    setError("");
    // keep info so the success message is visible on login screen
  };

  // 🔹 Helpers for social login so they also respect returnUrl
  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Google login failed");
    }
  };

  const handleAppleLogin = async () => {
    setError("");
    try {
      await loginWithApple();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Apple login failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 bg-[radial-gradient(1200px_600px_at_20%_-10%,#dcfce7_0%,transparent_60%),var(--bg)]">
      <div className="w-full max-w-[900px] bg-(--panel) border border-(--border) rounded-2xl shadow-(--shadow) overflow-hidden grid md:grid-cols-[1.05fr_1fr]">
        {/* Left: Hero */}
        <div className="relative min-h-[420px] p-7 bg-[linear-gradient(135deg,var(--brand-500),var(--brand-600))] text-white flex flex-col items-center justify-center gap-3.5">
          <div className="w-[132px] h-[132px] rounded-full grid place-items-center bg-white/90 border border-white/60 shadow-[0_14px_28px_rgba(0,0,0,0.12)] ring-8 ring-white/25">
            <img
              src={logo}
              alt="Halal Lens"
              className="w-24 h-24 object-contain"
            />
          </div>
          <div className="text-center font-extrabold tracking-[0.03em] opacity-95">
            Halal Lens
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-7 flex flex-col justify-center">
          {/* Header changes based on mode */}
          {mode === "login" ? (
            <>
              <h3 className="m-0 text-xl font-semibold text-slate-900">
                Welcome back
              </h3>
              <div className="mt-1 text-sm text-slate-500">
                Use your email and password to continue.
              </div>
            </>
          ) : (
            <>
              <h3 className="m-0 text-xl font-semibold text-slate-900">
                Reset your password
              </h3>
              <div className="mt-1 text-sm text-slate-500">
                Enter your email address and we&apos;ll send you a reset link.
              </div>
            </>
          )}

          {info && (
            <div className="mt-3 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {info}
            </div>
          )}

          {error && (
            <div className="mt-3 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* LOGIN VIEW */}
          {mode === "login" && (
            <>
              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Password
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </button>

                <div className="flex justify-between items-center mt-1">
                  <button
                    type="button"
                    className="cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
                    onClick={goToReset}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>

              {/* Social Login */}
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={handleGoogleLogin}
                >
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={handleAppleLogin}
                >
                  Continue with Apple
                </button>
              </div>
            </>
          )}

          {/* RESET PASSWORD VIEW */}
          {mode === "reset" && (
            <form onSubmit={handlePasswordReset} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={resetting}
                className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
              >
                {resetting ? "Sending reset link..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={goToLogin}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
