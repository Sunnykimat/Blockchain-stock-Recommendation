// ─────────────────────────────────────────────
//  components/VerificationCard.jsx
// ─────────────────────────────────────────────
import React from "react";
import { ShieldCheck, ShieldAlert, Clock, Hash, Layers, Zap } from "lucide-react";
import clsx from "clsx";

/**
 * Displays a blockchain verification result
 * @param {{ record }} props
 */
export default function VerificationCard({ record }) {
  const isVerified = record.status === "Verified";
  const isPending  = record.status === "Pending";

  const statusColor  = isVerified ? "#00ffd1" : isPending ? "#ffb020" : "#ff4560";
  const statusBadge  = isVerified ? "badge-verified" : isPending ? "badge-pending" : "badge-failed";

  const StatusIcon = isVerified ? ShieldCheck : isPending ? Clock : ShieldAlert;

  const truncate = (str, n = 24) =>
    str?.length > n ? `${str.slice(0, n)}…` : str;

  const rows = [
    { icon: Hash,   label: "Tx Hash",       value: truncate(record.txHash, 28) },
    { icon: Layers, label: "Block Number",   value: record.blockNumber?.toLocaleString() },
    { icon: Zap,    label: "Network",        value: record.network },
    { icon: Clock,  label: "Confirmed At",   value: new Date(record.timestamp).toLocaleString() },
    { icon: Hash,   label: "Data Hash",      value: truncate(record.dataHash, 28) },
    { icon: Layers, label: "Confirmations",  value: record.confirmations },
    { icon: Zap,    label: "Gas Used",       value: record.gasUsed?.toLocaleString() },
  ];

  return (
    <div
      className="glass rounded-xl overflow-hidden"
      style={{
        boxShadow: isVerified
          ? "0 0 30px rgba(0,255,209,0.08)"
          : "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          background: isVerified
            ? "linear-gradient(135deg, rgba(0,255,209,0.08), rgba(0,255,209,0.03))"
            : "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <StatusIcon size={20} style={{ color: statusColor }} />
          <div>
            <h3
              className="text-sm font-bold text-white/90"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {record.recommendationId}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              {record.symbol} · {record.network}
            </p>
          </div>
        </div>
        <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", statusBadge)}>
          {record.status}
        </span>
      </div>

      {/* Detail rows */}
      <div className="divide-y divide-white/5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2 text-white/40">
              <Icon size={12} />
              <span className="text-xs">{label}</span>
            </div>
            <span
              className="text-xs text-white/70 font-mono"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {value ?? "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Verified message */}
      {record.message && (
        <div
          className="px-5 py-3 text-xs"
          style={{
            background: isVerified
              ? "rgba(0,255,209,0.05)"
              : isPending
              ? "rgba(255,176,32,0.05)"
              : "rgba(255,69,96,0.05)",
            color: statusColor,
            borderTop: `1px solid ${statusColor}20`,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {record.message}
        </div>
      )}
    </div>
  );
}
