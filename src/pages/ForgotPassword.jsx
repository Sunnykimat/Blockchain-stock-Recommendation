// ─────────────────────────────────────────────
//  pages/ForgotPassword.jsx
//  Password Reset Recovery UI with clear unavailable service messaging
// ─────────────────────────────────────────────
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Zap, ArrowLeft, AlertCircle, Info } from "lucide-react";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponseMsg("");

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return setError("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: trimmed });
      setResponseMsg(
        res.message ||
          "Email verification is currently unavailable. Please contact the administrator or try again later."
      );
      setIsAvailable(!!res.available);
    } catch (err) {
      setError(
        err.message ||
          "Email verification is currently unavailable. Please contact the administrator or try again later."
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
          "radial-gradient(ellipse at 50% 40%, #061810 0%, #03050a 60%)",
      }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

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
              Password Recovery
            </p>
          </div>
        </div>

        <h2
          className="text-2xl font-bold text-white/90 mb-1"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Reset password
        </h2>
        <p className="text-sm text-white/40 mb-6">
          Enter your registered email address to request account recovery.
        </p>

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

        {responseMsg && (
          <div
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg mb-4 text-xs font-mono border leading-relaxed"
            style={{
              background: isAvailable ? "rgba(0,255,136,0.1)" : "rgba(255,176,32,0.1)",
              borderColor: isAvailable ? "rgba(0,255,136,0.3)" : "rgba(255,176,32,0.3)",
              color: isAvailable ? "#00ff88" : "#ffb020",
            }}
          >
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <span>{responseMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="input-dark w-full pl-9 pr-4 py-3 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying service…
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="flex items-center justify-center mt-6">
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-mono text-white/50 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
