// ─────────────────────────────────────────────
//  components/Top10RecommendationsSection.jsx
//  Interactive Top 10 Stock Recommendations Visualizations:
//  - Horizontal Bar Chart ranked by model confidence
//  - Recommendation Distribution (BUY, HOLD, SELL)
//  - Interactive Filters & Sorters
//  - Click-to-Inspect stock detail modal
// ─────────────────────────────────────────────
import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  BrainCircuit, ArrowUpRight, Filter, ArrowUpDown, Sparkles,
  TrendingUp, TrendingDown, Minus, CheckCircle2,
} from "lucide-react";

const CustomBarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div
      className="p-3 rounded-xl border shadow-xl text-xs font-mono select-none"
      style={{
        background: "rgba(10, 16, 28, 0.96)",
        borderColor: "rgba(0, 230, 118, 0.3)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="font-bold text-white/95 text-sm">{data.symbol}</span>
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold"
          style={{
            background:
              data.recommendation === "BUY"
                ? "rgba(0, 230, 118, 0.2)"
                : data.recommendation === "SELL"
                ? "rgba(255, 69, 96, 0.2)"
                : "rgba(255, 176, 32, 0.2)",
            color:
              data.recommendation === "BUY"
                ? "#00e676"
                : data.recommendation === "SELL"
                ? "#ff4560"
                : "#ffb020",
          }}
        >
          {data.recommendation}
        </span>
      </div>
      <p className="text-white/50 text-[11px] mb-2">{data.name}</p>
      <div className="space-y-1 text-white/70">
        <div className="flex justify-between gap-4">
          <span>AI Confidence:</span>
          <span className="font-bold text-emerald-400">{data.confidence}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Target Price:</span>
          <span className="text-white/90">${Number(data.targetPrice || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Projected Upside:</span>
          <span style={{ color: (data.upside ?? 0) >= 0 ? "#00ff88" : "#ff4560" }}>
            {(data.upside ?? 0) >= 0 ? "+" : ""}{data.upside}%
          </span>
        </div>
      </div>
      <p className="text-[10px] text-emerald-400/80 mt-2 pt-1.5 border-t border-white/10">
        Click bar to open stock details →
      </p>
    </div>
  );
};

export default function Top10RecommendationsSection({
  recommendations = [],
  onSelectStock,
}) {
  const [filterSignal, setFilterSignal] = useState("ALL"); // ALL | BUY | HOLD | SELL
  const [sortBy, setSortBy] = useState("confidence"); // confidence | upside | symbol

  const rawTop10 = recommendations.slice(0, 10);

  // Apply signal filtering
  const filtered = rawTop10.filter((item) =>
    filterSignal === "ALL" ? true : item.recommendation === filterSignal
  );

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "confidence") return b.confidence - a.confidence;
    if (sortBy === "upside") return (b.upside ?? 0) - (a.upside ?? 0);
    if (sortBy === "symbol") return a.symbol.localeCompare(b.symbol);
    return 0;
  });

  // Calculate signal distribution counts
  const buyCount = rawTop10.filter((r) => r.recommendation === "BUY").length;
  const holdCount = rawTop10.filter((r) => r.recommendation === "HOLD").length;
  const sellCount = rawTop10.filter((r) => r.recommendation === "SELL").length;

  return (
    <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
      {/* Header with Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
              <BrainCircuit size={17} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
              Top 10 Stock Recommendations
            </h2>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Quantitative multi-factor machine learning rankings · Interactive charts
          </p>
        </div>

        {/* Filters and Sorting bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Signal Filters */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {["ALL", "BUY", "HOLD", "SELL"].map((sig) => (
              <button
                key={sig}
                onClick={() => setFilterSignal(sig)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterSignal === sig
                    ? sig === "BUY"
                      ? "bg-emerald-500 text-black font-bold"
                      : sig === "SELL"
                      ? "bg-red-500 text-white font-bold"
                      : sig === "HOLD"
                      ? "bg-yellow-500 text-black font-bold"
                      : "bg-white/20 text-white font-bold"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {sig}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-white/60">
            <ArrowUpDown size={12} className="text-white/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 text-white/80 focus:outline-none cursor-pointer"
            >
              <option value="confidence" className="bg-[#0a101c] text-white">Confidence ↓</option>
              <option value="upside" className="bg-[#0a101c] text-white">Projected Upside ↓</option>
              <option value="symbol" className="bg-[#0a101c] text-white">Ticker A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signal Distribution Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-white/50 font-mono">BUY Signals</span>
          </div>
          <span className="text-base font-bold text-emerald-400 font-mono">{buyCount} / 10</span>
        </div>
        <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Minus size={14} className="text-yellow-400" />
            <span className="text-xs text-white/50 font-mono">HOLD Signals</span>
          </div>
          <span className="text-base font-bold text-yellow-400 font-mono">{holdCount} / 10</span>
        </div>
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-xs text-white/50 font-mono">SELL Signals</span>
          </div>
          <span className="text-base font-bold text-red-400 font-mono">{sellCount} / 10</span>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Bar Chart (Ranked by Confidence) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white/[0.015] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-semibold font-mono">
              Model Confidence Ranking (% Bounded)
            </span>
            <span className="text-white/30 font-mono text-[11px]">
              Click any bar to inspect stock
            </span>
          </div>

          {sorted.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sorted}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[50, 100]}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'DM Mono'" }}
                    unit="%"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="symbol"
                    type="category"
                    tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "'DM Mono'", fontWeight: "bold" }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="confidence"
                    radius={[0, 6, 6, 0]}
                    className="cursor-pointer"
                    onClick={(entry) => onSelectStock && onSelectStock(entry.symbol)}
                  >
                    {sorted.map((entry, index) => {
                      const color =
                        entry.recommendation === "BUY"
                          ? "#00e676"
                          : entry.recommendation === "SELL"
                          ? "#ff4560"
                          : "#ffb020";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-white/30 font-mono">
              No recommendations match selected signal filter
            </div>
          )}
        </div>

        {/* Interactive Top 10 Clickable List */}
        <div className="p-4 rounded-xl bg-white/[0.015] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
            <span className="text-white/60 font-semibold font-mono">Top Ranked Tickers</span>
            <span className="text-white/30 font-mono text-[11px]">Confidence</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {sorted.map((item, idx) => (
              <div
                key={item.id || item.symbol}
                onClick={() => onSelectStock && onSelectStock(item.symbol)}
                className="p-2.5 rounded-lg border border-white/5 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/[0.04] cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-white/30 w-4">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-mono font-bold text-xs text-white/90 group-hover:text-emerald-400 transition-colors">
                      {item.symbol}
                    </span>
                    <span
                      className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded"
                      style={{
                        background:
                          item.recommendation === "BUY"
                            ? "rgba(0, 230, 118, 0.15)"
                            : item.recommendation === "SELL"
                            ? "rgba(255, 69, 96, 0.15)"
                            : "rgba(255, 176, 32, 0.15)",
                        color:
                          item.recommendation === "BUY"
                            ? "#00e676"
                            : item.recommendation === "SELL"
                            ? "#ff4560"
                            : "#ffb020",
                      }}
                    >
                      {item.recommendation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white/80">
                    {item.confidence}%
                  </span>
                  <ArrowUpRight
                    size={13}
                    className="text-white/20 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
