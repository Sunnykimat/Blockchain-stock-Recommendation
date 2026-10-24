// ─────────────────────────────────────────────
//  components/Navbar.jsx
//  Fixed notification positioning, highest z-index (z-50),
//  scrollable container, click-outside & Escape key handlers,
//  mark-as-read, clickable stock links, loading/error states.
// ─────────────────────────────────────────────
import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell, Search, Menu, ChevronDown, LogOut, User, Shield,
  CheckCheck, RefreshCw, AlertCircle, ExternalLink, Sparkles,
} from "lucide-react";
import { AuthContext } from "../App";
import { currentUser } from "../utils/mockData";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/api";

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const activeUser = user || currentUser;

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [notifList, setNotifList] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [notifsError, setNotifsError] = useState(null);

  const notifsRef = useRef(null);
  const profileRef = useRef(null);

  const loadNotifications = async () => {
    setNotifsLoading(true);
    setNotifsError(null);
    try {
      const data = await fetchNotifications();
      setNotifList(Array.isArray(data) ? data : []);
    } catch {
      setNotifsError("Failed to load notifications from backend");
    } finally {
      setNotifsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowNotifs(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadCount = notifList.filter((n) => !n.read).length;

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchVal.trim()) {
      navigate(`/search?q=${searchVal.trim().toUpperCase()}`);
      setSearchVal("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkOne = async (id, e) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
    setNotifList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead();
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (n) => {
    handleMarkOne(n.id, { stopPropagation: () => {} });
    setShowNotifs(false);
    // Extract stock symbol from message if present
    const match = n.message?.match(/\b(NVDA|MSFT|AAPL|TSLA|GOOGL|AMZN|META|RELIANCE\.NS|TCS\.NS|INFY\.NS)\b/i);
    if (match) {
      navigate(`/search?q=${match[1].toUpperCase()}`);
    } else if (n.type === "blockchain") {
      navigate("/blockchain");
    } else {
      navigate("/recommendations");
    }
  };

  const notifTypeColor = (type) => {
    if (type === "recommendation") return "#00e676";
    if (type === "blockchain") return "#ffd166";
    if (type === "alert") return "#ff4560";
    return "rgba(255,255,255,0.4)";
  };

  return (
    <header
      className="flex items-center justify-between px-6 py-3 flex-shrink-0 relative z-30"
      style={{
        background: "rgba(6,12,20,0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="relative hidden sm:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search symbol… (Enter)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value.toUpperCase())}
            onKeyDown={handleSearch}
            className="input-dark pl-9 pr-4 py-2 rounded-lg text-sm w-52 focus:w-64 transition-all duration-300"
            style={{ fontFamily: "'DM Mono', monospace" }}
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative" ref={notifsRef}>
          <button
            onClick={() => {
              setShowNotifs((v) => !v);
              if (!showNotifs) loadNotifications();
            }}
            className="relative p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold animate-pulse"
                style={{
                  background: "#ff4560",
                  color: "#fff",
                  fontSize: "9px",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Elevated Notification Panel with Fixed Stacking & Max-height scroll */}
          {showNotifs && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl z-50 animate-slide-up border"
              style={{
                background: "rgba(10, 16, 28, 0.98)",
                borderColor: "rgba(0, 230, 118, 0.25)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.85), 0 0 25px rgba(0,230,118,0.12)",
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/90" style={{ fontFamily: "'Syne'" }}>
                    Live Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 text-[11px] font-mono text-white/40 hover:text-emerald-400 transition-colors"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              {/* Scrollable Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifsLoading && notifList.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-white/40 text-xs font-mono gap-2">
                    <RefreshCw size={14} className="animate-spin text-emerald-400" />
                    <span>Fetching live updates…</span>
                  </div>
                ) : notifsError ? (
                  <div className="p-4 text-center text-xs text-red-400 flex items-center justify-center gap-1.5 font-mono">
                    <AlertCircle size={13} /> {notifsError}
                  </div>
                ) : notifList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-white/30 font-mono">
                    No notifications at this time
                  </div>
                ) : (
                  notifList.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`px-4 py-3 hover:bg-white/[0.04] cursor-pointer transition-colors relative group ${
                        !n.read ? "bg-emerald-500/[0.03]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status indicator pip */}
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-all ${
                            !n.read
                              ? "bg-emerald-400 shadow-[0_0_8px_#00e676]"
                              : "bg-transparent border border-white/20"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/80 leading-relaxed group-hover:text-white transition-colors">
                            {n.message}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                            <span style={{ color: notifTypeColor(n.type) }}>
                              {n.type?.toUpperCase()}
                            </span>
                            <span className="text-white/30">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-white/40">
                <span>Esc to dismiss</span>
                <span className="text-emerald-400">Click item to view stock →</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #00ff88, #00e676)",
                color: "#03050a",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              {activeUser.name?.charAt(0) || "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white/80 leading-none">
                {activeUser.name}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(0,230,118,0.6)", fontFamily: "'DM Mono'" }}
              >
                {activeUser.plan}
              </p>
            </div>
            <ChevronDown size={12} className="text-white/30" />
          </button>

          {showProfile && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 border shadow-2xl"
              style={{
                background: "#0a1428",
                borderColor: "rgba(255,255,255,0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-white/80 font-semibold">{activeUser.name}</p>
                <p className="text-xs text-white/40 mt-0.5 truncate">{activeUser.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate("/settings");
                  setShowProfile(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
              >
                <User size={13} /> Profile & Settings
              </button>
              <button
                onClick={() => {
                  navigate("/blockchain");
                  setShowProfile(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
              >
                <Shield size={13} /> Blockchain Status
              </button>
              <div className="border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-white/5 transition-colors"
                  style={{ color: "#ff4560" }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
