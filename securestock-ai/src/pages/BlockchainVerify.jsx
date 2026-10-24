// ─────────────────────────────────────────────
//  pages/BlockchainVerify.jsx
//  On-Chain Recommendation Verification & Cryptographic Ledger Audit
// ─────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Hash, Search, AlertCircle, Loader,
  Layers, CheckCircle, XCircle, Clock, ExternalLink,
} from "lucide-react";
import VerificationCard from "../components/VerificationCard";
import { verifyBlockchain, verifyByTxHash, fetchBlockchainRecords } from "../services/api";
import { blockchainRecords, aiRecommendations } from "../utils/mockData";

function ChainStat({ label, value, color, icon: Icon }) {
  return (
    <div className="glass rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: "'Syne'", color }}>
        {value}
      </p>
    </div>
  );
}

export default function BlockchainVerify() {
  const [queryId, setQueryId] = useState("");
  const [queryHash, setQueryHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allRecords, setAllRecords] = useState([]);

  useEffect(() => {
    fetchBlockchainRecords().then((records) => setAllRecords(records || []));
  }, []);

  const handleVerifyById = async () => {
    if (!queryId.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await verifyBlockchain(queryId.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyByHash = async () => {
    if (!queryHash.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await verifyByTxHash(queryHash.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickVerify = (id) => {
    setQueryId(id);
    setQueryHash("");
    setError("");
    setResult(null);
    setLoading(true);
    verifyBlockchain(id)
      .then((d) => {
        setResult(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const verified = allRecords.filter((r) => r.status === "Verified").length;
  const pending = allRecords.filter((r) => r.status === "Pending").length;
  const failed = allRecords.filter((r) => r.status === "Failed").length;

  return (
    <div className="space-y-6 pb-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
          Cryptographic Blockchain Verification
        </h1>
        <p className="text-sm text-white/40 mt-0.5">
          Verify AI recommendation integrity via immutable on-chain smart contract hashes (Ethereum Sepolia / Mainnet)
        </p>
      </div>

      {/* ── Chain stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ChainStat label="Total Records" value={allRecords.length} color="#00ff88" icon={Layers} />
        <ChainStat label="Verified Integrity" value={verified} color="#00e676" icon={CheckCircle} />
        <ChainStat label="Pending Sync" value={pending} color="#ffb020" icon={Clock} />
        <ChainStat label="Failed / Altered" value={failed} color="#ff4560" icon={XCircle} />
      </div>

      {/* ── Verification panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* By Recommendation ID */}
        <div className="glass rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
              Verify by Recommendation ID
            </h2>
          </div>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyById()}
              placeholder="e.g. rec_NVDA_... or rec_001"
              className="input-dark flex-1 px-4 py-3 rounded-lg text-sm"
              style={{ fontFamily: "'DM Mono'" }}
            />
            <button
              onClick={handleVerifyById}
              disabled={loading}
              className="btn-primary px-5 py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {loading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
          </div>
          {/* Quick-pick IDs */}
          <div className="flex flex-wrap gap-1.5">
            {allRecords.slice(0, 7).map((r) => (
              <button
                key={r.recommendationId}
                onClick={() => quickVerify(r.recommendationId)}
                className="px-2 py-1 rounded text-xs transition-all hover:scale-105 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400/80 hover:text-emerald-300"
                style={{ fontFamily: "'DM Mono'" }}
              >
                {r.symbol || r.recommendationId.slice(0, 10)}
              </button>
            ))}
          </div>
        </div>

        {/* By Tx Hash */}
        <div className="glass rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Hash size={16} className="text-yellow-400" />
            <h2 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
              Verify by Ethereum Transaction Hash
            </h2>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={queryHash}
              onChange={(e) => setQueryHash(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyByHash()}
              placeholder="0x3a8f9b2c1d4e5f6a7b8c…"
              className="input-dark flex-1 px-4 py-3 rounded-lg text-sm"
              style={{ fontFamily: "'DM Mono'", fontSize: "11px" }}
            />
            <button
              onClick={handleVerifyByHash}
              disabled={loading}
              className="btn-primary px-5 py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {loading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
          </div>
          <p className="text-xs text-white/30 mt-3" style={{ fontFamily: "'DM Mono'" }}>
            Enter any 0x… transaction hash to cross-reference data against the smart contract ledger.
          </p>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: "rgba(255,69,96,0.08)", border: "1px solid rgba(255,69,96,0.25)" }}
        >
          <AlertCircle size={16} style={{ color: "#ff4560" }} />
          <p className="text-sm text-white/70">{error}</p>
        </div>
      )}

      {/* ── Verification result ── */}
      {loading && (
        <div className="glass rounded-xl p-12 flex flex-col items-center gap-4 border border-white/5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20" />
            <div className="absolute inset-2 rounded-full border-2 border-t-emerald-400 border-transparent animate-spin" />
            <ShieldCheck size={18} className="absolute inset-0 m-auto text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/70">Auditing blockchain hash match…</p>
            <p className="text-xs text-white/30 mt-1" style={{ fontFamily: "'DM Mono'" }}>
              Connecting to Smart Contract at 0x5eC9...E619
            </p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="animate-slide-up">
          <h3 className="text-sm font-bold text-white/60 mb-3">Verification Result</h3>
          <VerificationCard record={result} />
        </div>
      )}

      {/* ── All records table ── */}
      <div>
        <h2 className="text-base font-bold text-white/90 mb-4" style={{ fontFamily: "'Syne'" }}>
          All On-Chain Records
        </h2>
        <div className="glass rounded-xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {["Rec ID", "Symbol", "Block", "Tx Hash", "Confirmations", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-white/40 font-semibold"
                      style={{ fontFamily: "'DM Mono'" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRecords.map((rec) => (
                  <tr
                    key={rec.recommendationId}
                    className="table-row-hover cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onClick={() => quickVerify(rec.recommendationId)}
                  >
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {rec.recommendationId}
                    </td>
                    <td className="px-4 py-3 font-bold text-white/80">{rec.symbol}</td>
                    <td className="px-4 py-3 text-white/50 font-mono">
                      #{rec.blockNumber?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white/40 font-mono">
                      {rec.txHash?.slice(0, 18)}…
                    </td>
                    <td className="px-4 py-3 text-white/50 font-mono">
                      {rec.confirmations || 12}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          rec.status === "Verified"
                            ? "badge-verified"
                            : rec.status === "Pending"
                            ? "badge-pending"
                            : "badge-failed"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
