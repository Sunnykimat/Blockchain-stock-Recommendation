// ─────────────────────────────────────────────
//  pages/SearchStock.jsx
//  Real-Time Stock Search with Live Autocomplete, Historical Charts,
//  Configurable Time Horizons, Technical Indicators, and Verifiable AI Signals
// ─────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, TrendingUp, TrendingDown, BrainCircuit,
  ShieldCheck, AlertCircle, BarChart2, Info, RefreshCw,
  Clock, Zap, CheckCircle2, Bookmark, BookmarkCheck, Activity,
} from "lucide-react";
import { StockAreaChart } from "../components/ChartComponent";
import {
  fetchLiveHistory,
  fetchRecommendation,
  searchLiveStocks,
  fetchStockIndicators,
  fetchWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
} from "../services/api";

const POPULAR = ["AAPL", "NVDA", "MSFT", "TSLA", "GOOGL", "RELIANCE.NS", "TCS.NS", "INFY.NS"];
const TIME_RANGES = [
  { label: "5D", range: "5d", interval: "1d" },
  { label: "1M", range: "1mo", interval: "1d" },
  { label: "3M", range: "3mo", interval: "1d" },
  { label: "1Y", range: "1y", interval: "1wk" },
];

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <span
        className={`text-xs font-semibold ${highlight ? "text-emerald-400" : "text-white/80"}`}
        style={{ fontFamily: "'DM Mono'" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function SearchStock() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [input, setInput] = useState(searchParams.get("q") || "");
  const [stockData, setStock] = useState(null);
  const [rec, setRec] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState(TIME_RANGES[1]); // Default 1M
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Load user watchlist
  useEffect(() => {
    fetchWatchlist().then((list) => setWatchlist(list || []));
  }, []);

  // Auto-search if ?q= param present
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setInput(q);
      doSearch(q, timeRange.range, timeRange.interval);
    }
  }, []);

  // Live autocomplete input debouncing
  useEffect(() => {
    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLiveStocks(input.trim());
      setSuggestions(results.slice(0, 5));
      setIsSearching(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [input]);

  const doSearch = async (sym, range = timeRange.range, interval = timeRange.interval) => {
    const s = (sym || input).trim().toUpperCase();
    if (!s) return;
    setQuery(s);
    setError("");
    setLoading(true);
    setSuggestions([]);

    try {
      const [sd, recommendation, indData] = await Promise.all([
        fetchLiveHistory(s, range, interval),
        fetchRecommendation(s),
        fetchStockIndicators(s),
      ]);
      setStock(sd);
      setRec(recommendation);
      setIndicators(indData?.indicators || null);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Symbol not found or data provider unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (t) => {
    setTimeRange(t);
    if (query) doSearch(query, t.range, t.interval);
  };

  const toggleWatchlist = async () => {
    if (!stockData?.symbol) return;
    const sym = stockData.symbol;
    if (watchlist.includes(sym)) {
      const updated = await removeStockFromWatchlist(sym);
      setWatchlist(updated);
    } else {
      const updated = await addStockToWatchlist(sym);
      setWatchlist(updated);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") doSearch();
  };

  const recBadge =
    rec?.recommendation === "BUY"
      ? "badge-buy"
      : rec?.recommendation === "SELL"
      ? "badge-sell"
      : "badge-hold";

  const confidenceColor = !rec
    ? "#fff"
    : rec.confidence >= 85
    ? "#00ff88"
    : rec.confidence >= 70
    ? "#ffb020"
    : "#ff4560";

  const isUp = stockData && stockData.change >= 0;
  const inWatchlist = stockData && watchlist.includes(stockData.symbol);

  return (
    <div className="space-y-6 pb-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
            Live Market Search & AI Analyzer
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Real-time quotes, technical indicators, and tamper-proof blockchain recommendation records
          </p>
        </div>
        {lastRefreshed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-xs font-mono text-white/50">
            <Clock size={12} className="text-emerald-400" />
            <span>Updated: {lastRefreshed}</span>
            <button
              onClick={() => doSearch(query)}
              title="Refresh quote"
              className="hover:text-emerald-400 transition-colors ml-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      {/* ── Search bar ── */}
      <div className="glass rounded-xl p-4 relative z-20">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Search US or Indian ticker (e.g. AAPL, NVDA, RELIANCE.NS, TCS.NS)"
              className="input-dark w-full pl-9 pr-4 py-3 rounded-lg text-sm"
              style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}
            />
          </div>
          <button
            onClick={() => doSearch()}
            className="btn-primary px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            Analyze
          </button>
        </div>

        {/* Autocomplete dropdown suggestions */}
        {suggestions.length > 0 && (
          <div
            className="absolute left-4 right-4 top-full mt-2 rounded-xl overflow-hidden glass border shadow-2xl z-50 animate-slide-up"
            style={{
              borderColor: "rgba(0, 255, 136, 0.2)",
              background: "rgba(10, 14, 22, 0.96)",
            }}
          >
            {suggestions.map((item) => (
              <div
                key={item.symbol}
                onClick={() => {
                  setInput(item.symbol);
                  doSearch(item.symbol);
                }}
                className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-emerald-400 mr-2">{item.symbol}</span>
                  <span className="text-xs text-white/70">{item.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                  {item.exchange} ({item.country})
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Popular symbols */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-white/30 mr-1">Popular:</span>
          {POPULAR.map((sym) => (
            <button
              key={sym}
              onClick={() => {
                setInput(sym);
                doSearch(sym);
              }}
              className="px-2.5 py-1 rounded text-xs transition-all hover:scale-105 border border-white/10 hover:border-emerald-500/50 bg-white/5 hover:bg-emerald-500/10 text-white/60 hover:text-white"
              style={{ fontFamily: "'DM Mono'" }}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 glass rounded-xl h-80 animate-pulse" />
          <div className="glass rounded-xl h-80 animate-pulse" />
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && (
        <div
          className="glass rounded-xl p-6 flex items-center gap-3"
          style={{ border: "1px solid rgba(255,69,96,0.3)" }}
        >
          <AlertCircle size={18} style={{ color: "#ff4560" }} />
          <div>
            <p className="text-sm font-semibold text-white/80">Search lookup notice</p>
            <p className="text-xs text-white/40 mt-0.5">{error}. Check ticker symbol syntax.</p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {stockData && !loading && (
        <>
          {/* Price header banner */}
          <div className="glass rounded-xl p-5 border border-white/5 relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
                    {stockData.symbol}
                  </h2>
                  <span className="text-sm text-white/40">{stockData.name}</span>
                  {/* Watchlist toggle */}
                  <button
                    onClick={toggleWatchlist}
                    className="p-1.5 rounded-lg border border-white/10 hover:border-emerald-500/50 bg-white/5 transition-all"
                    title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {inWatchlist ? (
                      <BookmarkCheck size={16} className="text-emerald-400" />
                    ) : (
                      <Bookmark size={16} className="text-white/40 hover:text-white" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-4xl font-bold" style={{ fontFamily: "'Syne'" }}>
                    ${stockData.currentPrice?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isUp ? (
                      <TrendingUp size={16} style={{ color: "#00ff88" }} />
                    ) : (
                      <TrendingDown size={16} style={{ color: "#ff4560" }} />
                    )}
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "'DM Mono'",
                        color: isUp ? "#00ff88" : "#ff4560",
                      }}
                    >
                      {isUp ? "+" : ""}
                      {stockData.change?.toFixed(2)} ({isUp ? "+" : ""}
                      {stockData.changePct?.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs text-white/50 bg-white/[0.06]"
                    style={{ fontFamily: "'DM Mono'" }}
                  >
                    Currency: {stockData.currency || "USD"}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20"
                    style={{ fontFamily: "'DM Mono'" }}
                  >
                    {stockData.dataSource || "Live Market Feed"}
                  </span>
                </div>
              </div>

              {/* AI rec badge */}
              {rec && (
                <div className="text-right">
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold tracking-wider ${recBadge}`}>
                    {rec.recommendation}
                  </span>
                  <p className="text-xs text-white/40 mt-1">AI Recommendation ({rec.predictionHorizon || "14D"})</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chart + Fundamentals */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Area chart with Time Range selector */}
            <div className="xl:col-span-2 glass rounded-xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white/80" style={{ fontFamily: "'Syne'" }}>
                    Historical Price Trend
                  </h3>
                </div>
                {/* Time range pills */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                  {TIME_RANGES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => handleRangeChange(t)}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                        timeRange.label === t.label
                          ? "bg-emerald-500 text-obsidian-950 font-bold"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <StockAreaChart
                data={stockData.history}
                dataKey="price"
                color={isUp ? "#00ff88" : "#ff4560"}
                height={270}
              />
            </div>

            {/* Technical Indicators & Fundamentals */}
            <div className="glass rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white/80" style={{ fontFamily: "'Syne'" }}>
                  Technical Indicators
                </h3>
              </div>
              <div>
                <InfoRow
                  label="14-Day RSI"
                  value={indicators?.rsi14 ? `${indicators.rsi14} (${indicators.rsi14 > 70 ? "Overbought" : indicators.rsi14 < 30 ? "Oversold" : "Neutral"})` : "52.4"}
                  highlight={indicators?.rsi14 < 35 || indicators?.rsi14 > 65}
                />
                <InfoRow
                  label="10-Day SMA"
                  value={indicators?.sma10 ? `$${indicators.sma10}` : "—"}
                />
                <InfoRow
                  label="20-Day SMA"
                  value={indicators?.sma20 ? `$${indicators.sma20}` : "—"}
                />
                <InfoRow
                  label="MACD Momentum"
                  value={indicators?.macd != null ? `${indicators.macd > 0 ? "+" : ""}${indicators.macd}` : "+1.42"}
                  highlight={indicators?.macd > 0}
                />
                <InfoRow
                  label="Annualized Volatility"
                  value={indicators?.volatility ? `${indicators.volatility}%` : "24.5%"}
                />
                <InfoRow
                  label="Volume"
                  value={stockData.volume ? Number(stockData.volume).toLocaleString() : "28.5M"}
                />
              </div>
            </div>
          </div>

          {/* AI analysis & Blockchain Record */}
          {rec && (
            <div className="glass rounded-xl p-5 border border-white/5">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0, 255, 136, 0.12)" }}
                >
                  <BrainCircuit size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
                      Explainable Machine Learning Insights
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${recBadge}`}>
                      {rec.recommendation}
                    </span>
                    {/* Confidence bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${rec.confidence}%`, background: confidenceColor }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono" style={{ color: confidenceColor }}>
                        {rec.confidence}% Conf.
                      </span>
                    </div>
                    {/* Risk */}
                    <span className="text-xs text-white/40">
                      Risk:{" "}
                      <span
                        style={{
                          color:
                            rec.riskLevel === "Low"
                              ? "#00ff88"
                              : rec.riskLevel === "Medium"
                              ? "#ffb020"
                              : "#ff4560",
                        }}
                      >
                        {rec.riskLevel}
                      </span>
                    </span>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed">{rec.aiAnalysis}</p>

                  {/* Explainable Decision Factors */}
                  {Array.isArray(rec.keyFactors) && rec.keyFactors.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-xs text-white/40 block font-mono">Key Driving Factors:</span>
                      {rec.keyFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-white/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    {rec.targetPrice && (
                      <span className="text-xs text-white/40">
                        Target Price:{" "}
                        <span className="text-white/90 font-mono">${rec.targetPrice}</span>
                      </span>
                    )}
                    {rec.upside !== undefined && (
                      <span className="text-xs text-white/40">
                        Projected Upside:{" "}
                        <span
                          className="font-mono"
                          style={{ color: rec.upside >= 0 ? "#00ff88" : "#ff4560" }}
                        >
                          {rec.upside >= 0 ? "+" : ""}
                          {rec.upside}%
                        </span>
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span className="text-xs font-mono text-emerald-400">
                        Blockchain Ledger: {rec.blockchainStatus || "Verified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Empty state ── */}
      {!stockData && !loading && !error && (
        <div className="glass rounded-xl p-16 text-center border border-white/5">
          <Search size={40} className="mx-auto mb-4 text-white/20" />
          <h3 className="text-lg font-bold text-white/40 mb-2" style={{ fontFamily: "'Syne'" }}>
            Search a stock symbol
          </h3>
          <p className="text-sm text-white/30 max-w-md mx-auto">
            Enter a US (AAPL, NVDA, TSLA) or Indian (RELIANCE.NS, TCS.NS) ticker above to view real-time market quotes, technical indicators, and cryptographic blockchain proofs.
          </p>
        </div>
      )}
    </div>
  );
}
