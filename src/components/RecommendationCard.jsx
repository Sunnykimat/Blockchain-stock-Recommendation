// ─────────────────────────────────────────────
//  components/RecommendationCard.jsx
//  Interactive, fully-clickable card with pointer events,
//  hover transitions, border glow, accessibility & click handler
// ─────────────────────────────────────────────
import React from "react";
import { ShieldCheck, Clock, Target, ArrowUpRight, BrainCircuit } from "lucide-react";
import clsx from "clsx";

/**
 * @param {{ rec, compact, onClick }} props
 */
export default function RecommendationCard({ rec, compact = false, onClick }) {
  const {
    symbol, name, recommendation, confidence, riskLevel,
    targetPrice, currentPrice, upside, aiAnalysis,
    timestamp, blockchainStatus, modelVersion,
  } = rec;

  const badgeClass =
    recommendation === "BUY"
      ? "badge-buy"
      : recommendation === "SELL"
      ? "badge-sell"
      : "badge-hold";

  const confidenceColor =
    confidence >= 85 ? "#00ff88" : confidence >= 70 ? "#ffb020" : "#ff4560";

  const riskColor =
    riskLevel === "Low" ? "#00ff88" : riskLevel === "Medium" ? "#ffb020" : "#ff4560";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onClick) onClick();
        }
      }}
      className={clsx(
        "glass rounded-xl p-4 transition-all duration-300 group relative overflow-hidden border cursor-pointer select-none text-left",
        "hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
      )}
      style={{
        borderColor: "rgba(255, 255, 255, 0.08)",
        background: "rgba(14, 18, 28, 0.7)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Dynamic hover border glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{
          border: "1px solid rgba(0, 230, 118, 0.4)",
          boxShadow: "inset 0 0 15px rgba(0, 230, 118, 0.08)",
        }}
      />

      {/* Top: symbol + badge + action arrow */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold text-white/90 group-hover:text-emerald-400 transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {symbol}
            </span>
            <span
              className={clsx("px-2 py-0.5 rounded text-xs font-bold tracking-wider", badgeClass)}
            >
              {recommendation}
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-white/40 mt-0.5">{name || `${symbol} Corp.`}</p>
          )}
        </div>

        {/* Blockchain status & action arrow */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck
              size={13}
              style={{ color: blockchainStatus === "Verified" ? "#00e676" : "#ffb020" }}
            />
            <span
              className="text-xs"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: blockchainStatus === "Verified" ? "#00e676" : "#ffb020",
              }}
            >
              {blockchainStatus || "Verified"}
            </span>
          </div>
          <ArrowUpRight
            size={14}
            className="text-white/30 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/40">Model Confidence</span>
          <span
            className="text-xs font-bold font-mono"
            style={{ color: confidenceColor }}
          >
            {confidence}%
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${confidence}%`,
              background: `linear-gradient(90deg, ${confidenceColor}80, ${confidenceColor})`,
              boxShadow: `0 0 8px ${confidenceColor}60`,
            }}
          />
        </div>
      </div>

      {!compact && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-xs text-white/30 mb-0.5">Risk</p>
              <p className="text-xs font-bold" style={{ color: riskColor, fontFamily: "'DM Mono'" }}>
                {riskLevel || "Medium"}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-xs text-white/30 mb-0.5">Target</p>
              <p className="text-xs font-bold text-white/70" style={{ fontFamily: "'DM Mono'" }}>
                ${targetPrice ? Number(targetPrice).toFixed(0) : "—"}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-xs text-white/30 mb-0.5">Upside</p>
              <p
                className="text-xs font-bold"
                style={{
                  fontFamily: "'DM Mono'",
                  color: (upside ?? 0) > 0 ? "#00ff88" : "#ff4560",
                }}
              >
                {(upside ?? 0) > 0 ? "+" : ""}{upside ? Number(upside).toFixed(1) : "—"}%
              </p>
            </div>
          </div>

          {/* Analysis preview */}
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-3 group-hover:text-white/70 transition-colors">
            {aiAnalysis}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span
              className="text-xs text-white/30"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {modelVersion || "SecureStock v3.2"}
            </span>
            <span className="text-xs text-white/30 flex items-center gap-1 font-mono">
              <Clock size={10} />
              {timestamp ? new Date(timestamp).toLocaleDateString() : "Live"}
            </span>
          </div>
        </>
      )}

      {compact && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/30" style={{ fontFamily: "'DM Mono'" }}>
            Risk: <span style={{ color: riskColor }}>{riskLevel}</span>
          </span>
          <span className="text-xs text-white/30" style={{ fontFamily: "'DM Mono'" }}>
            {timestamp ? new Date(timestamp).toLocaleDateString() : "Live"}
          </span>
        </div>
      )}
    </div>
  );
}
