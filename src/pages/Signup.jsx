// ─────────────────────────────────────────────
//  pages/Signup.jsx
//  Secure Registration with Full Name, Email, Password & Confirm Password,
//  Strength Meter, Input Validation, and Immediate Dashboard Access
// ─────────────────────────────────────────────
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { AuthContext } from "../App";
import { registerUser } from "../services/api";

export default function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Password strength check
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ff4560", "#ffb020", "#ffd166", "#00ff88"][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      return setError("Please provide your full name.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return setError("Invalid email address format.");
    }

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }

    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    if (!form.agree) {
      return setError("Please accept the Terms of Service to continue.");
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirm,
      });
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message ||
          "Unable to create account with these details. Please check your information or try logging in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-10 px-4"
      style={{
        background:
          "radial-gradient(ellipse at 70% 30%, #061810 0%, #03050a 60%), radial-gradient(ellipse at 20% 80%, #022617 0%, transparent 50%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-10 right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-10 left-10 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Card */}
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

        <h2
          className="text-2xl font-bold text-white/90 mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Create account
        </h2>
        <p className="text-sm text-white/40 mb-6">Start your secure, blockchain-verified stock analysis</p>

        {/* Error Alert */}
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
          {/* Full name */}
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                required
                className="input-dark w-full pl-9 pr-4 py-3 rounded-lg text-sm"
              />
            </div>
          </div>

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
                placeholder="alex@example.com"
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
                placeholder="Min 8 characters"
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
            {/* Strength meter */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-xs mt-1 font-mono"
                  style={{ color: strengthColor }}
                >
                  Password Strength: {strengthLabel}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showConfirmPass ? "text" : "password"}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                className="input-dark w-full pl-9 pr-10 py-3 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                title={showConfirmPass ? "Hide password" : "Show password"}
              >
                {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {form.confirm && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-mono">
                {form.password === form.confirm ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} /> Passwords match
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className="w-4 h-4 mt-0.5 rounded flex-shrink-0 accent-emerald-400"
            />
            <span className="text-xs text-white/50 leading-relaxed">
              I agree to the{" "}
              <span className="text-emerald-400 hover:underline">Terms of Service</span> and{" "}
              <span className="text-emerald-400 hover:underline">Privacy Policy</span>
            </span>
          </label>

          {/* Submit */}
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
                Creating account…
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
