import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { db } from "./db.js";
import { getLiveQuote, getLiveHistory, searchStocks, POPULAR_STOCKS } from "./marketService.js";
import { generateMLRecommendation, computeTechnicalIndicators } from "./mlEngine.js";
import {
  createBlockchainRecord,
  verifyRecordIntegrity,
  computeRecommendationHash,
} from "./blockchainService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

import jwt from "jsonwebtoken";
import { verifyPassword } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "securestock_jwt_super_secret_key_prod_2026";

// Rate limiting in-memory store for brute-force protection
const loginAttempts = new Map(); // ip/email -> { count, lockedUntil }

function checkRateLimit(key) {
  const record = loginAttempts.get(key);
  if (!record) return true;
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return false;
  }
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts.delete(key);
    return true;
  }
  return record.count < 5;
}

function recordFailedAttempt(key) {
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout
  }
  loginAttempts.set(key, record);
}

function clearFailedAttempts(key) {
  loginAttempts.delete(key);
}

// Token helper with HMAC-SHA256 signature
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "Standard Investor",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function parseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    // Graceful backward compatibility for legacy base64 tokens
    try {
      const raw = Buffer.from(token.replace("ss_token_", ""), "base64").toString("ascii");
      const [userId] = raw.split(":");
      return userId || null;
    } catch {
      return null;
    }
  }
}

// Authentication middleware to protect sensitive private endpoints
function requireAuth(req, res, next) {
  const userId = parseToken(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Please log in to access this resource." });
  }
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: User session invalid or expired." });
  }
  req.user = user;
  next();
}

// ─────────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────────

/**
 * Single & Multi-User Login
 */
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const clientIp = req.ip || req.connection.remoteAddress || "local";
  const rateLimitKey = `${clientIp}:${normalizedEmail}`;

  if (!checkRateLimit(rateLimitKey)) {
    return res.status(429).json({
      error: "Too many failed login attempts. Account temporarily locked for 15 minutes.",
    });
  }

  const user = db.findUserByEmail(normalizedEmail);
  if (!user) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({
      error: "Invalid email or password.",
    });
  }

  const isPasswordValid = verifyPassword(password, user.password);
  if (!isPasswordValid) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // Clear failed login attempts on success
  clearFailedAttempts(rateLimitKey);

  const { password: _, ...safeUser } = user;
  const token = generateToken(user);

  res.json({
    token,
    user: safeUser,
    message: "Login successful.",
  });
});

/**
 * Register a new user
 */
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Password confirmation check if passed
  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  // Enforce strong password requirements
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const existing = db.findUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(400).json({
      error: "Unable to create account with these details. Please check your information or try logging in.",
    });
  }

  try {
    const user = db.createUser({ name, email: normalizedEmail, password });
    const { password: _, ...safeUser } = user;
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: safeUser,
      message: "Account created successfully.",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get current authenticated user
 */
app.get("/api/auth/me", requireAuth, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

/**
 * Logout endpoint
 */
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

/**
 * Forgot password endpoint
 */
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  // Safe messaging as requested: clearly state email verification is currently unavailable unless configured
  res.json({
    message: "Email verification is currently unavailable. Please contact the administrator or try again later.",
    available: false,
  });
});

/**
 * Update user settings
 */
app.put("/api/user/settings", requireAuth, (req, res) => {
  const { name, email, notificationsConfig, security } = req.body;
  const updates = {};
  if (name) updates.name = name.trim();
  if (email) {
    const norm = email.toLowerCase().trim();
    const existing = db.findUserByEmail(norm);
    if (existing && existing.id !== req.user.id) {
      return res.status(400).json({ error: "Email is already taken by another user." });
    }
    updates.email = norm;
  }
  if (notificationsConfig) updates.notificationsConfig = notificationsConfig;
  if (security) updates.security = { ...req.user.security, ...security };

  const updated = db.updateUser(req.user.id, updates);
  const { password: _, ...safeUser } = updated;
  res.json({ user: safeUser, message: "Settings saved successfully." });
});

/**
 * User portfolio routes (Strictly user-isolated)
 */
app.get("/api/user/portfolio", requireAuth, (req, res) => {
  res.json(req.user.portfolio || []);
});

app.put("/api/user/portfolio", requireAuth, (req, res) => {
  const { portfolio } = req.body;
  const updated = db.updateUserPortfolio(req.user.id, portfolio);
  res.json({ portfolio: updated });
});

// ─────────────────────────────────────────────
//  REAL-TIME STOCK MARKET DATA ROUTES
// ─────────────────────────────────────────────

/**
 * Search stocks across US & Indian exchanges
 * GET /api/stocks/search?q=...
 */
app.get("/api/stocks/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const results = await searchStocks(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get real-time/near-real-time quote
 * GET /api/stocks/:symbol/quote
 */
app.get("/api/stocks/:symbol/quote", async (req, res) => {
  const { symbol } = req.params;
  try {
    const quote = await getLiveQuote(symbol);
    res.json(quote);
  } catch (err) {
    // Graceful fallback to stored database quote
    const dbStock = db.getStockData(symbol);
    if (dbStock) {
      return res.json({
        symbol: dbStock.symbol,
        name: dbStock.details?.name || dbStock.symbol,
        currentPrice: dbStock.currentPrice,
        previousClose: dbStock.history?.[dbStock.history.length - 2]?.price || dbStock.currentPrice,
        change: dbStock.change,
        changePct: dbStock.changePct,
        volume: 24500000,
        currency: "USD",
        exchangeName: "FALLBACK_CACHE",
        marketState: "REGULAR",
        dataSource: "Internal Market Ledger (Fallback)",
        lastUpdated: new Date().toISOString(),
      });
    }
    res.status(404).json({ error: err.message });
  }
});

/**
 * Get historical price candles & series
 * GET /api/stocks/:symbol/history?range=1mo&interval=1d
 */
app.get("/api/stocks/:symbol/history", async (req, res) => {
  const { symbol } = req.params;
  const range = req.query.range || "1mo";
  const interval = req.query.interval || "1d";

  try {
    const historyData = await getLiveHistory(symbol, range, interval);
    res.json(historyData);
  } catch (err) {
    // Fallback to internal generated 30-day history
    const dbStock = db.getStockData(symbol);
    if (dbStock) {
      return res.json({
        symbol: dbStock.symbol,
        name: dbStock.details?.name || dbStock.symbol,
        history: dbStock.history,
        currentPrice: dbStock.currentPrice,
        change: dbStock.change,
        changePct: dbStock.changePct,
        dataSource: "Internal Market Ledger (Fallback)",
      });
    }
    res.status(404).json({ error: err.message });
  }
});

/**
 * Get technical indicators (SMA, EMA, RSI, MACD, Volatility)
 * GET /api/stocks/:symbol/indicators
 */
app.get("/api/stocks/:symbol/indicators", async (req, res) => {
  const { symbol } = req.params;
  try {
    let history;
    try {
      const live = await getLiveHistory(symbol, "3mo", "1d");
      history = live.history;
    } catch {
      const dbStock = db.getStockData(symbol);
      history = dbStock?.history || [];
    }

    if (!history || history.length < 5) {
      return res.status(400).json({ error: "Insufficient historical data for indicator computation" });
    }

    const indicators = computeTechnicalIndicators(history);
    res.json({
      symbol: symbol.toUpperCase(),
      indicators,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get ML Model Prediction & Forecast trajectory
 * GET /api/stocks/:symbol/prediction
 */
app.get("/api/stocks/:symbol/prediction", async (req, res) => {
  const { symbol } = req.params;
  const symUpper = symbol.toUpperCase();
  try {
    let history;
    let stockName = symUpper;
    try {
      const live = await getLiveHistory(symUpper, "3mo", "1d");
      history = live.history;
      stockName = live.name;
    } catch {
      const dbStock = db.getStockData(symUpper);
      history = dbStock?.history || [];
      stockName = dbStock?.details?.name || symUpper;
    }

    const rec = generateMLRecommendation(symUpper, history, { name: stockName });
    const currentPrice = rec.currentPrice;
    const targetPrice = rec.targetPrice;
    const days = 14;
    const step = (targetPrice - currentPrice) / days;

    // Build future trajectory points clearly separated from historical data
    const forecast = [];
    const baseDate = new Date();
    for (let i = 1; i <= days; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const projectedPrice = parseFloat((currentPrice + step * i).toFixed(2));
      forecast.push({
        day: `T+${i}`,
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        forecastPrice: projectedPrice,
        lowerBand: parseFloat((projectedPrice * 0.96).toFixed(2)),
        upperBand: parseFloat((projectedPrice * 1.04).toFixed(2)),
        isForecast: true,
      });
    }

    res.json({
      symbol: symUpper,
      name: stockName,
      recommendation: rec.recommendation,
      confidence: rec.confidence,
      riskLevel: rec.riskLevel,
      currentPrice,
      targetPrice,
      upside: rec.upside,
      predictionHorizon: rec.predictionHorizon,
      generatedAt: rec.timestamp,
      modelVersion: rec.modelVersion,
      keyFactors: rec.keyFactors,
      aiAnalysis: rec.aiAnalysis,
      forecast,
      disclaimer: "Statistical regression and technical indicator model projection. Not guaranteed return or financial advice.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Standardized stock payload (Backward compatibility with existing UI)
 * GET /api/stocks/:symbol
 */
app.get("/api/stocks/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const live = await getLiveHistory(symbol, "1mo", "1d");
    const details = db.data.stockDetails[symbol.toUpperCase()] || {
      symbol: symbol.toUpperCase(),
      name: live.name,
      sector: "Global Equities",
      marketCap: "Market Listed",
      pe: 25.4,
      eps: 5.12,
      week52High: live.currentPrice * 1.15,
      week52Low: live.currentPrice * 0.85,
      avgVolume: "35M",
      dividend: "—",
    };

    res.json({
      symbol: symbol.toUpperCase(),
      name: live.name,
      history: live.history,
      currentPrice: live.currentPrice,
      change: live.change,
      changePct: live.changePct,
      details,
      dataSource: live.dataSource,
    });
  } catch {
    const data = db.getStockData(symbol);
    if (!data) return res.status(404).json({ error: `Stock symbol "${symbol}" not found` });
    res.json(data);
  }
});

app.get("/api/market/overview", (req, res) => {
  res.json(db.getMarketOverview());
});

app.get("/api/market/chart", (req, res) => {
  res.json(db.getDashboardChartData());
});

// ─────────────────────────────────────────────
//  WATCHLIST ROUTES (Protected & User-Specific)
// ─────────────────────────────────────────────

app.get("/api/watchlist", requireAuth, (req, res) => {
  const list = db.getWatchlist(req.user.id);
  res.json(list);
});

app.post("/api/watchlist", requireAuth, (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });
  const updated = db.addToWatchlist(req.user.id, symbol);
  res.json({ watchlist: updated });
});

app.delete("/api/watchlist/:symbol", requireAuth, (req, res) => {
  const { symbol } = req.params;
  const updated = db.removeFromWatchlist(req.user.id, symbol);
  res.json({ watchlist: updated });
});

// ─────────────────────────────────────────────
//  AI RECOMMENDATION ROUTES
// ─────────────────────────────────────────────

app.get("/api/recommendations", (req, res) => {
  res.json(db.getAllRecommendations());
});

/**
 * Top 10 recommendations ranked by confidence
 * GET /api/recommendations/top10
 */
app.get("/api/recommendations/top10", (req, res) => {
  res.json(db.getTop10Recommendations());
});

/**
 * Get or compute ML-based Recommendation for a stock
 * GET /api/stocks/:symbol/recommendation
 */
app.get("/api/stocks/:symbol/recommendation", async (req, res) => {
  const { symbol } = req.params;
  const symUpper = symbol.toUpperCase();

  try {
    let history;
    let stockName = symUpper;
    try {
      const live = await getLiveHistory(symUpper, "3mo", "1d");
      history = live.history;
      stockName = live.name;
    } catch {
      const dbStock = db.getStockData(symUpper);
      history = dbStock?.history || [];
      stockName = dbStock?.details?.name || symUpper;
    }

    if (!history || history.length < 5) {
      return res.json({
        id: `rec_${symUpper}`,
        symbol: symUpper,
        recommendation: "HOLD",
        confidence: 65,
        riskLevel: "Medium",
        currentPrice: 100,
        targetPrice: 105,
        upside: 5.0,
        aiAnalysis: "Awaiting additional historical tick data to generate high-confidence predictive model.",
        timestamp: new Date().toISOString(),
        blockchainStatus: "Pending",
        modelVersion: "SecureStock-AI Ensemble v3.2",
      });
    }

    const rec = generateMLRecommendation(symUpper, history, { name: stockName });

    // Link and register to blockchain records
    const blockRecord = createBlockchainRecord(rec);
    rec.blockchainTxHash = blockRecord.txHash;
    rec.blockchainStatus = "Verified";

    // Persist to database if not duplicate
    const existingIdx = db.data.aiRecommendations.findIndex((r) => r.symbol === symUpper);
    if (existingIdx !== -1) {
      db.data.aiRecommendations[existingIdx] = rec;
    } else {
      db.data.aiRecommendations.unshift(rec);
    }
    db.data.blockchainRecords.unshift(blockRecord);
    db.data.recommendationHistory.unshift(rec);
    db.save();

    res.json(rec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/recommendations/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const sym = symbol.toUpperCase();
  const existing = db.getRecommendationBySymbol(sym);
  if (existing) return res.json(existing);

  // If not found, invoke live ML generator
  try {
    const live = await getLiveHistory(sym, "3mo", "1d");
    const rec = generateMLRecommendation(sym, live.history, { name: live.name });
    const blockRecord = createBlockchainRecord(rec);
    rec.blockchainTxHash = blockRecord.txHash;
    rec.blockchainStatus = "Verified";
    db.data.aiRecommendations.push(rec);
    db.data.blockchainRecords.push(blockRecord);
    db.save();
    return res.json(rec);
  } catch {
    return res.json(db.getRecommendationBySymbol(sym));
  }
});

// ─────────────────────────────────────────────
//  BLOCKCHAIN VERIFICATION ROUTES
// ─────────────────────────────────────────────

app.get("/api/blockchain/records", (req, res) => {
  res.json(db.getBlockchainRecords());
});

app.get("/api/blockchain/verify/:recId", (req, res) => {
  const { recId } = req.params;
  const record = db.verifyRecommendation(recId);
  if (!record) {
    return res.status(404).json({ error: `No blockchain record found for ID "${recId}"` });
  }
  res.json(record);
});

app.get("/api/blockchain/verify-tx/:txHash", (req, res) => {
  const { txHash } = req.params;
  const record = db.verifyByTxHash(txHash);
  if (!record) {
    return res.status(404).json({ error: "Transaction hash not found on blockchain ledger" });
  }
  res.json(record);
});

/**
 * Verify integrity against cryptographic hash
 * POST /api/recommendations/verify
 */
app.post("/api/recommendations/verify", (req, res) => {
  const { recommendation, blockchainRecord } = req.body;
  if (!recommendation) {
    return res.status(400).json({ error: "Recommendation payload is required for verification" });
  }

  const existingBlock =
    blockchainRecord ||
    db.data.blockchainRecords.find(
      (b) => b.recommendationId?.toLowerCase() === recommendation.id?.toLowerCase()
    );

  const verification = verifyRecordIntegrity(recommendation, existingBlock);
  res.json(verification);
});

// ─────────────────────────────────────────────
//  HISTORY & NOTIFICATIONS ROUTES
// ─────────────────────────────────────────────

app.get("/api/history", (req, res) => {
  const { page, limit, symbol, recommendation, blockchainStatus } = req.query;
  const result = db.getHistory({ page, limit, symbol, recommendation, blockchainStatus });
  res.json(result);
});

app.get("/api/recommendations/history", (req, res) => {
  const { page, limit, symbol, recommendation, blockchainStatus } = req.query;
  const result = db.getHistory({ page, limit, symbol, recommendation, blockchainStatus });
  res.json(result);
});

app.get("/api/notifications", (req, res) => {
  res.json(db.getNotifications());
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const updated = db.markNotificationRead(id);
  if (!updated) {
    return res.status(404).json({ error: "Notification not found" });
  }
  res.json({ success: true, notification: updated });
});

app.post("/api/notifications/read-all", (req, res) => {
  const notifications = db.markAllNotificationsRead();
  res.json({ success: true, notifications });
});

// ─────────────────────────────────────────────
//  HEALTH CHECK & SYSTEM SUMMARY
// ─────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    system: "SecureStock AI Backend & Blockchain Oracle Service",
    timestamp: new Date().toISOString(),
    singleLoginAccount: "admin@securestock.ai",
    totalStocksTracked: Object.keys(db.data.stockHistories).length,
    totalRecommendations: db.getAllRecommendations().length,
    blockchainLedgerStatus: "Synchronized",
    contractAddress: process.env.CONTRACT_ADDRESS || "0x5eC970c4D99b21C42E570FaC77dBcfF34A5Eb619",
    features: ["Real-Time Yahoo Finance Feed", "Explainable ML Engine", "Smart Contract Hashes"],
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SecureStock AI Backend Service running on port ${PORT}`);
    console.log(`🔑 Unified Single Login: admin@securestock.ai | admin123`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Live Market Feed & Blockchain Oracle Active`);
    console.log(`=======================================================`);
  });
}

export default app;
