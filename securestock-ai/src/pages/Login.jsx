// ─────────────────────────────────────────────
//  pages/Login.jsx
//  Secure, Responsive Login with Validation, Password Visibility,
//  Emerald & Obsidian Theme, and Protected Route Redirect
// ─────────────────────────────────────────────
import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { AuthContext } from "../App";
import { loginUser } from "../services/api";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({
    email: "admin@securestock.ai",
    password: "admin123",
    remember: true,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleExecuteLogin = async (credentials) => {
    setError("");
    const trimmedEmail = (credentials.email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!credentials.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email: trimmedEmail, password: credentials.password });
      if (credentials.remember) {
        localStorage.setItem("ss_email", trimmedEmail);
      } else {
        localStorage.removeItem("ss_email");
      }
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleExecuteLogin(form);
  };

  const handleQuickMasterLogin = () => {
    const masterCreds = { email: "admin@securestock.ai", password: "admin123", remember: true };
    setForm(masterCreds);
    handleExecuteLogin(masterCreds);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 px-4"
      style={{
        background:
          "radial-gradient(ellipse at 30% 50%, #061810 0%, #03050a 60%), radial-gradient(ellipse at 80% 20%, #022617 0%, transparent 50%)",
      }}
    >
      {/* Decorative emerald cyber grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating ambient glow orbs */}
      <div
        className="absolute top-20 left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-20 right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Glass Card */}
      <div
        className="glass rounded-2xl p-8 w-full max-w-md relative z-10 animate-slide-up border"
        style={{
          borderColor: "rgba(0, 255, 136, 0.2)",
          background: "rgba(10, 15, 24, 0.94)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 20px rgba(0,255,136,0.1)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #00ff88, #00e676)" }}
          >
            <Zap size={20} style={{ color: "#03050a" }} />
          </div>
          <div>
            <h1
              className="text-lg font-bold text-white tracking-wide"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              SecureStock AI
            </h1>
            <p
              className="text-xs text-white/40"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Blockchain · Intelligence
            </p>
          </div>
        </div>

        {/* 1-Click Master Account Ribbon */}
        <div
          className="rounded-xl p-3.5 mb-6 border transition-all"
          style={{
            background: "rgba(0, 255, 136, 0.05)",
            borderColor: "rgba(0, 255, 136, 0.25)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <Sparkles size={13} className="text-emerald-400" />
                <span>Single Master Account</span>
              </div>
              <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                Connects Sunny Kumar's Master Portfolio, AI signals, & Ethereum Smart Contract identity.
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickMasterLogin}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 flex-shrink-0 bg-emerald-400 text-obsidian-950 hover:bg-emerald-300"
            >
              <ShieldCheck size={13} />
              1-Click Login
            </button>
          </div>
        </div>

        <h2
          className="text-2xl font-bold text-white/90 mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Sign In
        </h2>
        <p className="text-xs text-white/40 mb-6">Access your secure stock & blockchain dashboard</p>

        {/* Error message alert */}
        {error && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4 text-sm border"
            style={{
              background: "rgba(255,69,96,0.1)",
              borderColor: "rgba(255,69,96,0.3)",
              color: "#ff4560",
            }}
          >
            <AlertCircle size={15} className="flex-shrink-0" />
            <span className="text-xs leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@securestock.ai"
                required
                className="input-dark w-full pl-9 pr-4 py-3 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input-dark w-full pl-9 pr-10 py-3 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                title={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-emerald-400"
              />
              <span className="text-xs text-white/50">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-emerald-400 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-lg text-sm font-semibold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Authenticating…
              </span>
            ) : (
              "Sign In to Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-emerald-400 hover:underline font-semibold">
            Create account
          </Link>
        </p>

        {/* Demo credentials info */}
        <div
          className="mt-4 px-3 py-2.5 rounded-lg text-center text-xs text-white/40 border border-white/5"
          style={{ background: "rgba(255,255,255,0.02)", fontFamily: "'DM Mono', monospace" }}
        >
          Master Login: <span className="text-white/80">admin@securestock.ai</span> / <span className="text-white/80">admin123</span>
        </div>
      </div>
    </div>
  );
}
