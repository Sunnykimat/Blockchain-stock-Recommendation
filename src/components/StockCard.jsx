// ─────────────────────────────────────────────
//  components/StockCard.jsx
//  Displays a market overview metric card
// ─────────────────────────────────────────────
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

/**
 * @param {{ symbol, name, price, change, changePct, trend }} props
 */
export default function StockCard({ symbol, name, price, change, changePct, trend }) {
  const isUp = trend === "up";

  return (
    <div
      className="glass rounded-xl p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer group relative overflow-hidden"
      style={{
        boxShadow: isUp
          ? "0 4px 24px rgba(0,255,148,0.06)"
          : "0 4px 24px rgba(255,69,96,0.06)",
      }}
    >
      {/* Subtle corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none transition-opacity opacity-30 group-hover:opacity-50"
        style={{
          background: isUp
            ? "radial-gradient(circle, rgba(0,255,148,0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(255,69,96,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Symbol + trend icon */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-semibold tracking-widest text-white/50"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {symbol}
        </span>
        {isUp ? (
          <TrendingUp size={14} style={{ color: "#00ff94" }} />
        ) : (
          <TrendingDown size={14} style={{ color: "#ff4560" }} />
        )}
      </div>

      {/* Price */}
      <div
        className="text-xl font-bold text-white/90 leading-none"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {price >= 1000
          ? price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
          : price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Change */}
      <div className="flex items-center gap-1.5 mt-1.5">
        <span
          className={clsx("text-xs font-semibold", isUp ? "text-green-400" : "text-red-400")}
          style={{
            fontFamily: "'DM Mono', monospace",
            color: isUp ? "#00ff94" : "#ff4560",
          }}
        >
          {isUp ? "+" : ""}
          {change.toFixed(2)}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            fontFamily: "'DM Mono', monospace",
            background: isUp ? "rgba(0,255,148,0.1)" : "rgba(255,69,96,0.1)",
            color: isUp ? "#00ff94" : "#ff4560",
          }}
        >
          {isUp ? "+" : ""}
          {changePct.toFixed(2)}%
        </span>
      </div>

      <div className="text-xs text-white/30 mt-2">{name}</div>
    </div>
  );
}
