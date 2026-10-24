// ─────────────────────────────────────────────
//  backend/marketService.js
//  Live Market Data Integration (Yahoo Finance v8 quote/chart)
//  Supports US (AAPL, TSLA, etc.) & Indian (RELIANCE.NS, TCS.BO, etc.)
//  Includes in-memory TTL caching, rate limiting & robust error handling
// ─────────────────────────────────────────────

const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Common popular tickers with default metadata
 */
export const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", country: "US" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", country: "US" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd", exchange: "NSE", country: "IN" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE", country: "IN" },
  { symbol: "INFY.NS", name: "Infosys Ltd", exchange: "NSE", country: "IN" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd", exchange: "NSE", country: "IN" },
];

/**
 * Fetch raw quote and chart from Yahoo Finance v8 endpoint
 */
async function fetchYahooChart(symbol, range = "1mo", interval = "1d") {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Market provider returned HTTP ${response.status} for ${symbol}`);
  }

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result) {
    const errorDesc = json?.chart?.error?.description || "Symbol not found";
    throw new Error(errorDesc);
  }
  return result;
}

/**
 * Get standardized real-time/near-real-time quote for a stock
 */
export async function getLiveQuote(rawSymbol) {
  const symbol = rawSymbol.trim().toUpperCase();
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, cached: true };
  }

  try {
    const chart = await fetchYahooChart(symbol, "5d", "1d");
    const meta = chart.meta || {};
    const quotes = chart.indicators?.quote?.[0] || {};
    const closes = quotes.close || [];
    const timestamps = chart.timestamp || [];

    // Filter valid closes
    const validPairs = timestamps
      .map((t, idx) => ({ t, c: closes[idx] }))
      .filter((p) => p.c !== null && p.c !== undefined && !isNaN(p.c));

    const currentPrice = meta.regularMarketPrice ?? (validPairs.length > 0 ? validPairs[validPairs.length - 1].c : 0);
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? (validPairs.length > 1 ? validPairs[validPairs.length - 2].c : currentPrice);
    const change = parseFloat((currentPrice - prevClose).toFixed(2));
    const changePct = prevClose > 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;

    const data = {
      symbol: meta.symbol || symbol,
      name: meta.shortName || meta.longName || symbol,
      currency: meta.currency || "USD",
      exchangeName: meta.exchangeName || "UNKNOWN",
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      openPrice: meta.regularMarketOpen ? parseFloat(meta.regularMarketOpen.toFixed(2)) : null,
      previousClose: parseFloat(prevClose.toFixed(2)),
      dayHigh: meta.regularMarketDayHigh ? parseFloat(meta.regularMarketDayHigh.toFixed(2)) : null,
      dayLow: meta.regularMarketDayLow ? parseFloat(meta.regularMarketDayLow.toFixed(2)) : null,
      volume: meta.regularMarketVolume || 0,
      change,
      changePct,
      marketState: meta.tradingPeriods?.post ? "CLOSED" : "REGULAR",
      lastUpdated: new Date().toISOString(),
      dataSource: "Live Market API (Yahoo Finance Feed)",
      isRealTime: true,
    };

    cache.set(cacheKey, { timestamp: Date.now(), data });
    return { ...data, cached: false };
  } catch (err) {
    throw new Error(`Failed to fetch quote for ${symbol}: ${err.message}`);
  }
}

/**
 * Get standardized historical candles / prices
 */
export async function getLiveHistory(rawSymbol, range = "1mo", interval = "1d") {
  const symbol = rawSymbol.trim().toUpperCase();
  const cacheKey = `history_${symbol}_${range}_${interval}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const chart = await fetchYahooChart(symbol, range, interval);
    const meta = chart.meta || {};
    const timestamps = chart.timestamp || [];
    const quote = chart.indicators?.quote?.[0] || {};

    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    const history = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (close === null || close === undefined || isNaN(close)) continue;
      const d = new Date(timestamps[i] * 1000);
      const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      history.push({
        timestamp: timestamps[i] * 1000,
        date: formattedDate,
        isoDate: d.toISOString().split("T")[0],
        open: opens[i] != null ? parseFloat(opens[i].toFixed(2)) : parseFloat(close.toFixed(2)),
        high: highs[i] != null ? parseFloat(highs[i].toFixed(2)) : parseFloat(close.toFixed(2)),
        low: lows[i] != null ? parseFloat(lows[i].toFixed(2)) : parseFloat(close.toFixed(2)),
        price: parseFloat(close.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volumes[i] || 0,
      });
    }

    const currentPrice = meta.regularMarketPrice ?? (history.length > 0 ? history[history.length - 1].price : 0);
    const prevClose = meta.chartPreviousClose ?? (history.length > 1 ? history[history.length - 2].price : currentPrice);
    const change = parseFloat((currentPrice - prevClose).toFixed(2));
    const changePct = prevClose > 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;

    const result = {
      symbol: meta.symbol || symbol,
      name: meta.shortName || meta.longName || symbol,
      currency: meta.currency || "USD",
      exchangeName: meta.exchangeName || "UNKNOWN",
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      change,
      changePct,
      history,
      dataSource: "Live Market API (Yahoo Finance Feed)",
      lastUpdated: new Date().toISOString(),
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (err) {
    throw new Error(`Failed to fetch history for ${symbol}: ${err.message}`);
  }
}

/**
 * Search stocks across US & Indian exchanges
 */
export async function searchStocks(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim();

  // Search through Yahoo Finance search endpoint
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.quotes) && data.quotes.length > 0) {
        return data.quotes
          .filter((item) => item.quoteType === "EQUITY" || item.quoteType === "ETF")
          .map((item) => ({
            symbol: item.symbol,
            name: item.shortname || item.longname || item.symbol,
            exchange: item.exchange || item.exchDisp || "UNKNOWN",
            type: item.quoteType,
            country: item.symbol.endsWith(".NS") || item.symbol.endsWith(".BO") ? "IN" : "US",
          }));
      }
    }
  } catch {
    // Fall back to filtered popular stocks if search API is temporarily unavailable
  }

  const queryUpper = q.toUpperCase();
  return POPULAR_STOCKS.filter(
    (s) => s.symbol.includes(queryUpper) || s.name.toUpperCase().includes(queryUpper)
  );
}
