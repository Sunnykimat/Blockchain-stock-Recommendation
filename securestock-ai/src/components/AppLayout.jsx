// ─────────────────────────────────────────────
//  components/AppLayout.jsx
//  Shell that wraps all authenticated pages
// ─────────────────────────────────────────────
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import LiveBackendStatusBox from "./LiveBackendStatusBox";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--obsidian-950)" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--obsidian-950)" }}>
          {/* Subtle electric emerald mesh background */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(0, 230, 118, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.04) 0%, transparent 40%), radial-gradient(circle at 10% 80%, rgba(255, 255, 255, 0.015) 0%, transparent 35%)",
              zIndex: 0,
            }}
          />
          <div className="relative z-10 max-w-screen-xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Live System Information Box */}
      <LiveBackendStatusBox />
    </div>
  );
}
