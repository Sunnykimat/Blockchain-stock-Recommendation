// ─────────────────────────────────────────────
//  pages/History.jsx
// ─────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import {
  History as HistoryIcon, Filter, ChevronLeft, ChevronRight,
  Download, Search, ShieldCheck,
} from "lucide-react";
import { getRecommendationHistory } from "../services/api";

const REC_OPTS    = ["", "BUY", "HOLD", "SELL"];
const STATUS_OPTS = ["", "Verified", "Pending", "Failed"];

function Badge({ type, value }) {
  if (type === "rec") {
    const cls = value === "BUY" ? "badge-buy" : value === "SELL" ? "badge-sell" : "badge-hold";
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${cls}`}>{value}</span>;
  }
  const cls = value === "Verified" ? "badge-verified" : value === "Pending" ? "badge-pending" : "badge-failed";
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{value}</span>;
}

export default function History() {
  const [data, setData]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    symbol: "", recommendation: "", blockchainStatus: "",
  });
  const [page, setPage]   = useState(1);
  const LIMIT = 8;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRecommendationHistory({ page, limit: LIMIT, ...filters });
      setData(res.data);
      setTotal(res.total);
    } finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  const handleFilter = (key, value) => {
    setPage(1);
    setFilters(f => ({ ...f, [key]: value }));
  };

  const totalPages = Math.ceil(total / LIMIT);

  // CSV export (client-side mock)
  const exportCSV = () => {
    const headers = "Symbol,Recommendation,Confidence,Date,Blockchain Status";
    const rows = data.map(r =>
      `${r.symbol},${r.recommendation},${r.confidence}%,${new Date(r.timestamp).toLocaleDateString()},${r.blockchainStatus}`
    ).join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "recommendation_history.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const confidenceColor = (c) => c >= 85 ? "#00ff94" : c >= 70 ? "#ffb020" : "#ff4560";

  return (
    <div className="space-y-6 pb-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
            Recommendation History
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Full audit trail of all AI-generated recommendations
          </p>
        </div>
        <button onClick={exportCSV}
          className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* ── Filters bar ── */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
        <Filter size={13} className="text-white/40" />

        {/* Symbol search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text" placeholder="Symbol…"
            value={filters.symbol}
            onChange={e => handleFilter("symbol", e.target.value.toUpperCase())}
            className="input-dark pl-7 pr-3 py-2 rounded-lg text-xs w-28"
            style={{ fontFamily: "'DM Mono'" }}
          />
        </div>

        {/* Recommendation type */}
        <select value={filters.recommendation}
          onChange={e => handleFilter("recommendation", e.target.value)}
          className="input-dark px-3 py-2 rounded-lg text-xs"
          style={{ fontFamily: "'DM Mono'" }}>
          <option value="">All Types</option>
          {REC_OPTS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        {/* Blockchain status */}
        <select value={filters.blockchainStatus}
          onChange={e => handleFilter("blockchainStatus", e.target.value)}
          className="input-dark px-3 py-2 rounded-lg text-xs"
          style={{ fontFamily: "'DM Mono'" }}>
          <option value="">All Statuses</option>
          {STATUS_OPTS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        {/* Clear */}
        {(filters.symbol || filters.recommendation || filters.blockchainStatus) && (
          <button onClick={() => { setFilters({ symbol: "", recommendation: "", blockchainStatus: "" }); setPage(1); }}
            className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded hover:bg-white/5">
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-white/30" style={{ fontFamily: "'DM Mono'" }}>
          {total} records
        </span>
      </div>

      {/* ── Table ── */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24"
              style={{ color: "#00ffd1" }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <HistoryIcon size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-sm text-white/40">No records match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                {[
                  "Symbol", "Name", "Recommendation", "Confidence",
                  "Risk", "Date", "Blockchain",
                ].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-white/40 font-semibold"
                    style={{ fontFamily: "'DM Mono'" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id}
                  className="table-row-hover transition-colors"
                  style={{
                    borderBottom: i < data.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {/* Symbol */}
                  <td className="px-4 py-3.5 font-bold" style={{ color: "#00ffd1", fontFamily: "'Syne'" }}>
                    {row.symbol}
                  </td>
                  {/* Name */}
                  <td className="px-4 py-3.5 text-white/50 truncate max-w-[140px]">
                    {row.name ?? "—"}
                  </td>
                  {/* Recommendation */}
                  <td className="px-4 py-3.5">
                    <Badge type="rec" value={row.recommendation} />
                  </td>
                  {/* Confidence */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${row.confidence}%`, background: confidenceColor(row.confidence) }} />
                      </div>
                      <span style={{ color: confidenceColor(row.confidence), fontFamily: "'DM Mono'" }}>
                        {row.confidence}%
                      </span>
                    </div>
                  </td>
                  {/* Risk */}
                  <td className="px-4 py-3.5"
                    style={{
                      fontFamily: "'DM Mono'",
                      color: row.riskLevel === "Low" ? "#00ff94" : row.riskLevel === "Medium" ? "#ffb020" : "#ff4560",
                    }}>
                    {row.riskLevel ?? "—"}
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3.5 text-white/50" style={{ fontFamily: "'DM Mono'" }}>
                    {new Date(row.timestamp).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  {/* Blockchain */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={11} style={{
                        color: row.blockchainStatus === "Verified" ? "#00ffd1"
                          : row.blockchainStatus === "Pending" ? "#ffb020" : "#ff4560",
                      }} />
                      <Badge type="chain" value={row.blockchainStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30" style={{ fontFamily: "'DM Mono'" }}>
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost flex items-center gap-1 px-3 py-2 rounded-lg text-xs disabled:opacity-30">
              <ChevronLeft size={13} /> Prev
            </button>
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className="w-8 h-8 rounded-lg text-xs transition-all"
                style={{
                  background: page === n ? "rgba(0,255,209,0.15)" : "rgba(255,255,255,0.05)",
                  color: page === n ? "#00ffd1" : "rgba(255,255,255,0.5)",
                  border: page === n ? "1px solid rgba(0,255,209,0.3)" : "1px solid transparent",
                  fontFamily: "'DM Mono'",
                }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost flex items-center gap-1 px-3 py-2 rounded-lg text-xs disabled:opacity-30">
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
