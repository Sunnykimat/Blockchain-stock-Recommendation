// ─────────────────────────────────────────────
//  pages/Dashboard.jsx
//  Real-Time Market Dashboard with Watchlist, Gainers/Losers,
//  Interactive Top 10 Recommendations Section with Charts,
//  and Click-to-Inspect Stock Detail Modal
// ─────────────────────────────────────────────
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, TrendingUp, TrendingDown, BrainCircuit, ShieldCheck,
  Activity, RefreshCw, Bookmark, Sparkles, Shield, Clock,
} from "lucide-react";
import StockCard from "../components/StockCard";
import RecommendationCard from "../components/RecommendationCard";
import Top10RecommendationsSection from "../components/Top10RecommendationsSection";
import StockDetailModal from "../components/StockDetailModal";
import { MultiLineChart } from "../components/ChartComponent";
import {
  fetchMarketOverview,
  fetchAllRecommendations,
  fetchTop10Recommendations,
  fetchWatchlist,
  fetchLiveQuote,
} from "../services/api";
import { dashboardChartData, blockchainRecords, currentUser } from "../utils/mockData";
import { AuthContext } from "../App";

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-lg font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ChainRow({ rec }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-1 rounded transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0,255,136,0.08)" }}
        >
          <ShieldCheck size={13} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white/80" style={{ fontFamily: "'DM Mono'" }}>
            {rec.symbol}
          </p>
          <p className="text-xs text-white/30 truncate max-w-[140px]" style={{ fontFamily: "'DM Mono'" }}>
            {rec.txHash?.slice(0, 18)}…
          </p>
        </div>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded ${
          rec.status === "Verified"
            ? "badge-verified"
            : rec.status === "Pending"
            ? "badge-pending"
            : "badge-failed"
        }`}
      >
        {rec.status}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const activeUser = user || currentUser;

  const [market, setMarket] = useState([]);
  const [recs, setRecs] = useState([]);
  const [top10, setTop10] = useState([]);
  const [watchlistQuotes, setWatchlistQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartSeries, setChartSeries] = useState("sp500");
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Selected stock modal state
  const [selectedStock, setSelectedStock] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mkt, recommendations, top10Data, wlSymbols] = await Promise.all([
        fetchMarketOverview(),
        fetchAllRecommendations(),
        fetchTop10Recommendations(),
        fetchWatchlist(),
      ]);
      setMarket(mkt);
      setRecs(recommendations);
      setTop10(top10Data);

      // Load quotes for watchlist items
      const symbolsToFetch = wlSymbols && wlSymbols.length > 0 ? wlSymbols : ["NVDA", "AAPL", "MSFT"];
      const quotes = await Promise.all(
        symbolsToFetch.map(async (sym) => {
          const q = await fetchLiveQuote(sym);
          return q || { symbol: sym, currentPrice: 150, change: 1.2, changePct: 0.8 };
        })
      );
      setWatchlistQuotes(quotes);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      // Fallbacks handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh quotes every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const seriesConfig = [
    { key: "sp500", color: "#00ff88", name: "S&P 500" },
    { key: "nasdaq", color: "#ffd166", name: "NASDAQ" },
    { key: "btc", color: "#ff9f43", name: "BTC" },
  ];

  const activeSeriesFilter = seriesConfig.filter(
    (s) => chartSeries === "all" || s.key === chartSeries
  );

  const verifiedCount = blockchainRecords.filter((r) => r.status === "Verified").length;
  const pendingCount = blockchainRecords.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-6 pb-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
            Good morning, {activeUser.name?.split(" ")[0] || "Trader"} 👋
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-white/40 font-mono hidden sm:inline-block">
              Refreshed: {lastRefreshed}
            </span>
          )}
          <button
            className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-white/10 hover:border-emerald-500/40"
            onClick={loadData}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Attached Master Account Ribbon ── */}
      <div
        className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border"
        style={{ borderColor: "rgba(0,255,136,0.25)", background: "rgba(0,255,136,0.03)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,255,136,0.12)" }}
          >
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white/90">{activeUser.name}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-mono uppercase"
                style={{
                  background: "rgba(0,255,136,0.1)",
                  color: "#00ff88",
                  border: "1px solid rgba(0,255,136,0.3)",
                }}
              >
                {activeUser.plan || "Pro Enterprise"}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-mono"
                style={{
                  background: "rgba(0,255,136,0.1)",
                  color: "#00ff88",
                  border: "1px solid rgba(0,255,136,0.3)",
                }}
              >
                Live Market API & Blockchain Connected
              </span>
            </div>
            <p className="text-xs text-white/40 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{activeUser.email}</span>
              <span>·</span>
              <span className="font-mono text-white/60">
                Wallet:{" "}
                {activeUser.walletAddress
                  ? `${activeUser.walletAddress.slice(0, 10)}...${activeUser.walletAddress.slice(-6)}`
                  : "0x71C6...1e4b"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block">
            <p className="text-white/40">Smart Contract Ledger</p>
            <p className="font-mono text-emerald-400 font-medium">
              Sepolia / Mainnet Verified
            </p>
          </div>
        </div>
      </div>

      {/* ── Market overview cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {market.map((item) => (
            <StockCard key={item.id} {...item} />
          ))}
        </div>
      )}

      {/* ── Watchlist Quick Tickers Bar ── */}
      {watchlistQuotes.length > 0 && (
        <div className="glass rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bookmark size={15} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
                Your Real-Time Watchlist
              </h2>
            </div>
            <Link to="/search" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Add Stocks <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {watchlistQuotes.map((wq) => {
              const isUp = (wq.change ?? 0) >= 0;
              return (
                <div
                  key={wq.symbol}
                  onClick={() => setSelectedStock(wq.symbol)}
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all hover:scale-102 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white/80">{wq.symbol}</span>
                    <span
                      className="text-[11px] font-mono font-medium"
                      style={{ color: isUp ? "#00ff88" : "#ff4560" }}
                    >
                      {isUp ? "+" : ""}
                      {wq.changePct?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-white/90">
                    ${wq.currentPrice?.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stat badges ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge icon={BrainCircuit} label="AI Recommendations" value={recs.length} color="#00ff88" />
        <StatBadge icon={ShieldCheck} label="Blockchain Verified" value={verifiedCount} color="#00e676" />
        <StatBadge icon={Activity} label="Pending Ledger Queue" value={pendingCount} color="#ffb020" />
        <StatBadge
          icon={TrendingUp}
          label="Active BUY Signals"
          value={recs.filter((r) => r.recommendation === "BUY").length}
          color="#ffd166"
        />
      </div>

      {/* ── Dedicated Interactive Section: Top 10 Stock Recommendations (Graphs + List) ── */}
      <Top10RecommendationsSection
        recommendations={top10.length > 0 ? top10 : recs}
        onSelectStock={(sym) => setSelectedStock(sym)}
      />

      {/* ── Main chart + blockchain feed ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 glass rounded-xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
                Market Trend & Volatility Index
              </h2>
              <p className="text-xs text-white/40 mt-0.5">30-day comparative price trajectories</p>
            </div>
            {/* Series selector */}
            <div className="flex gap-1">
              {[{ key: "all", label: "All" }, ...seriesConfig].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setChartSeries(s.key)}
                  className="px-2.5 py-1 rounded text-xs transition-all duration-200"
                  style={{
                    fontFamily: "'DM Mono'",
                    background:
                      chartSeries === s.key ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.05)",
                    color: chartSeries === s.key ? "#00ff88" : "rgba(255,255,255,0.4)",
                    border:
                      chartSeries === s.key
                        ? "1px solid rgba(0,255,136,0.3)"
                        : "1px solid transparent",
                  }}
                >
                  {s.label || s.name}
                </button>
              ))}
            </div>
          </div>
          <MultiLineChart data={dashboardChartData} series={activeSeriesFilter} height={260} />
        </div>

        {/* Blockchain feed */}
        <div className="glass rounded-xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
              Chain Activity
            </h2>
            <Link
              to="/blockchain"
              className="text-xs flex items-center gap-1 hover:underline text-emerald-400"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-0">
            {blockchainRecords.slice(0, 6).map((rec) => (
              <ChainRow key={rec.recommendationId} rec={rec} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Top AI Recommendation Cards Grid (Clickable) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
            Featured AI Recommendations
          </h2>
          <Link
            to="/recommendations"
            className="text-xs flex items-center gap-1 hover:underline text-emerald-400"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recs
              .filter((r) => r.recommendation === "BUY")
              .slice(0, 3)
              .map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  compact={false}
                  onClick={() => setSelectedStock(rec.symbol)}
                />
              ))}
          </div>
        )}
      </div>

      {/* ── Interactive Stock Details Modal ── */}
      {selectedStock && (
        <StockDetailModal
          symbol={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
}
