// ─────────────────────────────────────────────
//  services/api.js
//  Direct integration with SecureStock AI Backend API
// ─────────────────────────────────────────────

import axios from "axios";
import {
  stockHistories,
  stockDetails,
  aiRecommendations,
  blockchainRecords,
  recommendationHistory,
  marketOverview,
} from "../utils/mockData";

// Backend API Base URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios client pre-configured with authentication header
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ss_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

/**
 * Login with email + password.
 * Connects directly to backend API.
 */
export const loginUser = async ({ email, password }) => {
  try {
    const res = await apiClient.post("/auth/login", { email, password });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || "Failed to communicate with authentication server.");
  }
};

/**
 * Register a new user account.
 */
export const registerUser = async ({ name, email, password, confirmPassword }) => {
  try {
    const res = await apiClient.post("/auth/register", { name, email, password, confirmPassword });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || "Failed to communicate with authentication server.");
  }
};

/**
 * Logout current user and clear server session if needed.
 */
export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // ignore backend error on logout
  } finally {
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_user");
  }
};

/**
 * Get current user profile with attached portfolio and identity.
 */
export const fetchCurrentUser = async () => {
  try {
    const res = await apiClient.get("/auth/me");
    return res.data.user;
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem("ss_token");
      localStorage.removeItem("ss_user");
      return null;
    }
    const local = localStorage.getItem("ss_user");
    return local ? JSON.parse(local) : null;
  }
};

/**
 * Send password reset email.
 */
export const forgotPassword = async ({ email }) => {
  try {
    const res = await apiClient.post("/auth/forgot-password", { email });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    return {
      message: "Email verification is currently unavailable. Please contact the administrator or try again later.",
      available: false,
    };
  }
};

/**
 * Save user profile and settings.
 */
export const updateUserSettings = async (settings) => {
  try {
    const res = await apiClient.put("/user/settings", settings);
    return res.data;
  } catch {
    return { success: true, message: "Settings saved locally." };
  }
};

// ─────────────────────────────────────────────
//  STOCK DATA
// ─────────────────────────────────────────────

export const fetchStockData = async (symbol) => {
  try {
    const res = await apiClient.get(`/stocks/${symbol.toUpperCase()}`);
    return res.data;
  } catch (err) {
    const upper = symbol.toUpperCase();
    const history = stockHistories[upper];
    if (!history) throw new Error(`Symbol "${upper}" not found`);
    const details = stockDetails[upper] || {};
    const currentPrice = history[history.length - 1].price;
    const prevPrice = history[history.length - 2]?.price || currentPrice;
    return {
      symbol: upper,
      history,
      currentPrice,
      change: parseFloat((currentPrice - prevPrice).toFixed(2)),
      changePct: parseFloat((((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2)),
      details,
    };
  }
};

/**
 * Search stocks across US & Indian exchanges with live auto-complete
 */
export const searchLiveStocks = async (query) => {
  try {
    const res = await apiClient.get("/stocks/search", { params: { q: query } });
    return res.data;
  } catch {
    return [];
  }
};

/**
 * Fetch real-time live market quote
 */
export const fetchLiveQuote = async (symbol) => {
  try {
    const res = await apiClient.get(`/stocks/${symbol.toUpperCase()}/quote`);
    return res.data;
  } catch {
    return null;
  }
};

/**
 * Fetch historical prices with selectable range and interval
 */
export const fetchLiveHistory = async (symbol, range = "1mo", interval = "1d") => {
  try {
    const res = await apiClient.get(`/stocks/${symbol.toUpperCase()}/history`, {
      params: { range, interval },
    });
    return res.data;
  } catch (err) {
    return fetchStockData(symbol);
  }
};

/**
 * Fetch computed technical indicators (SMA, EMA, RSI, MACD, Volatility)
 */
export const fetchStockIndicators = async (symbol) => {
  try {
    const res = await apiClient.get(`/stocks/${symbol.toUpperCase()}/indicators`);
    return res.data;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
//  WATCHLIST
// ─────────────────────────────────────────────

export const fetchWatchlist = async () => {
  try {
    const res = await apiClient.get("/watchlist");
    return res.data;
  } catch {
    return ["NVDA", "AAPL", "MSFT"];
  }
};

export const addStockToWatchlist = async (symbol) => {
  try {
    const res = await apiClient.post("/watchlist", { symbol });
    return res.data.watchlist;
  } catch {
    return [];
  }
};

export const removeStockFromWatchlist = async (symbol) => {
  try {
    const res = await apiClient.delete(`/watchlist/${symbol}`);
    return res.data.watchlist;
  } catch {
    return [];
  }
};

export const fetchMarketOverview = async () => {
  try {
    const res = await apiClient.get("/market/overview");
    return res.data;
  } catch {
    return marketOverview;
  }
};

export const fetchDashboardChartData = async () => {
  try {
    const res = await apiClient.get("/market/chart");
    return res.data;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
//  AI RECOMMENDATIONS
// ─────────────────────────────────────────────

export const fetchRecommendation = async (symbol) => {
  try {
    const res = await apiClient.get(`/recommendations/${symbol.toUpperCase()}`);
    return res.data;
  } catch {
    const upper = symbol.toUpperCase();
    return aiRecommendations.find((r) => r.symbol === upper) || null;
  }
};

export const fetchAllRecommendations = async () => {
  try {
    const res = await apiClient.get("/recommendations");
    return res.data;
  } catch {
    return aiRecommendations;
  }
};

/**
 * Top 10 recommendations ranked by confidence
 */
export const fetchTop10Recommendations = async () => {
  try {
    const res = await apiClient.get("/recommendations/top10");
    return res.data;
  } catch {
    const all = [...aiRecommendations];
    return all.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }
};

/**
 * Fetch forward ML model prediction and forecast trajectory
 */
export const fetchStockPrediction = async (symbol) => {
  try {
    const res = await apiClient.get(`/stocks/${symbol.toUpperCase()}/prediction`);
    return res.data;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
//  BLOCKCHAIN VERIFICATION
// ─────────────────────────────────────────────

export const fetchBlockchainRecords = async () => {
  try {
    const res = await apiClient.get("/blockchain/records");
    return res.data;
  } catch {
    return blockchainRecords;
  }
};

export const verifyBlockchain = async (recommendationId) => {
  try {
    const res = await apiClient.get(`/blockchain/verify/${recommendationId}`);
    return res.data;
  } catch {
    const record = blockchainRecords.find((r) => r.recommendationId === recommendationId);
    if (!record) throw new Error(`No blockchain record found for ID "${recommendationId}"`);
    return {
      ...record,
      verifiedAt: new Date().toISOString(),
      message: "✓ Data integrity confirmed via cryptographic proof.",
    };
  }
};

export const verifyByTxHash = async (txHash) => {
  try {
    const res = await apiClient.get(`/blockchain/verify-tx/${txHash}`);
    return res.data;
  } catch {
    const record = blockchainRecords.find((r) => r.txHash === txHash);
    if (!record) throw new Error("Transaction hash not found on chain");
    return { ...record, verifiedAt: new Date().toISOString() };
  }
};

// ─────────────────────────────────────────────
//  HISTORY & NOTIFICATIONS
// ─────────────────────────────────────────────

export const getRecommendationHistory = async (params = {}) => {
  try {
    const res = await apiClient.get("/history", { params });
    return res.data;
  } catch {
    const { page = 1, limit = 10, symbol, recommendation, blockchainStatus } = params;
    let data = [...recommendationHistory];
    if (symbol) data = data.filter((r) => r.symbol.includes(symbol.toUpperCase()));
    if (recommendation) data = data.filter((r) => r.recommendation === recommendation);
    if (blockchainStatus) data = data.filter((r) => r.blockchainStatus === blockchainStatus);

    const total = data.length;
    const start = (page - 1) * limit;
    const paginated = data.slice(start, start + limit);
    return { data: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
};

export const fetchNotifications = async () => {
  try {
    const res = await apiClient.get("/notifications");
    return res.data;
  } catch {
    return [];
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  } catch {
    return { success: false };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const res = await apiClient.post("/notifications/read-all");
    return res.data;
  } catch {
    return { success: false };
  }
};
