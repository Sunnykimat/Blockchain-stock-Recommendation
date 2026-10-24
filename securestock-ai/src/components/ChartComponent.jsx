// ─────────────────────────────────────────────
//  components/ChartComponent.jsx
//  Reusable Recharts line/area chart for stock prices
// ─────────────────────────────────────────────
import React from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Custom tooltip styled for the dark theme
const CustomTooltip = ({ active, payload, label, prefix = "$" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{
        background: "#0a1428",
        border: "1px solid rgba(0,230,118,0.3)",
        fontFamily: "'DM Mono', monospace",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      }}
    >
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#00e676" }}>
          {p.name ? `${p.name}: ` : ""}
          {prefix}{Number(p.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
};

/**
 * Single-series area chart (stock price history)
 * @param {{ data, dataKey, color, height, prefix }} props
 */
export function StockAreaChart({
  data,
  dataKey = "price",
  color = "#00ffd1",
  height = 200,
  prefix = "$",
  showGrid = true,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        )}
        <XAxis
          dataKey="date"
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'DM Mono'" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'DM Mono'" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${prefix}${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip prefix={prefix} />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${dataKey})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#03050a", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Multi-series line chart (dashboard overview)
 * @param {{ data, series, height }} props
 * series: [{ key, color, name }]
 */
export function MultiLineChart({ data, series, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'DM Mono'" }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'DM Mono'" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip />} />
        {series.map(({ key, color, name }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={name}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "#03050a", strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default StockAreaChart;
