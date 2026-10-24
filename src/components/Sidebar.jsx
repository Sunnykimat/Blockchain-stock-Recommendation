// ─────────────────────────────────────────────
//  components/Sidebar.jsx
// ─────────────────────────────────────────────
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  BrainCircuit,
  ShieldCheck,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/dashboard",       icon: LayoutDashboard, label: "Dashboard" },
  { to: "/search",          icon: Search,          label: "Search Stock" },
  { to: "/recommendations", icon: BrainCircuit,    label: "AI Recommendations" },
  { to: "/blockchain",      icon: ShieldCheck,     label: "Blockchain Verify" },
  { to: "/history",         icon: History,         label: "History" },
  { to: "/settings",        icon: Settings,        label: "Settings" },
];

export default function Sidebar({ open, onToggle }) {
  return (
    <aside
      className={clsx(
        "flex flex-col transition-all duration-300 ease-in-out relative z-20 flex-shrink-0",
        open ? "w-60" : "w-16"
      )}
      style={{
        background: "linear-gradient(180deg, #060c14 0%, #03050a 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #00ff88, #00e676)" }}
        >
          <Zap size={16} className="text-obsidian-950" style={{ color: "#03050a" }} />
        </div>
        {open && (
          <div className="overflow-hidden">
            <span
              className="text-sm font-display font-800 leading-none gradient-text-cyan whitespace-nowrap"
              style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "13px" }}
            >
              SecureStock
            </span>
            <span
              className="block text-xs text-white/30 mt-0.5 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px" }}
            >
              AI · Blockchain
            </span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "nav-item-active"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={clsx(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-[#00e676]" : "text-current"
                  )}
                />
                {open && (
                  <span
                    className={clsx(
                      "text-sm whitespace-nowrap transition-colors",
                      isActive ? "text-[#00e676]" : "text-current"
                    )}
                    style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
                  >
                    {label}
                  </span>
                )}
                {/* Tooltip when collapsed */}
                {!open && (
                  <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-obsidian-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                    style={{ background: "#0a1428", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version badge */}
      {open && (
        <div className="px-4 py-3 border-t border-white/5">
          <div
            className="text-xs px-2 py-1 rounded text-center"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "rgba(0,230,118,0.5)",
              background: "rgba(0,230,118,0.05)",
            }}
          >
            Model v3.2 · Chain: Mainnet
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 z-30"
        style={{
          background: "#0a1428",
          border: "1px solid rgba(0,230,118,0.3)",
          color: "#00e676",
        }}
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
