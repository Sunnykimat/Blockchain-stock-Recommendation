// ─────────────────────────────────────────────
//  utils/mockData.js
//  All mock data consumed by API placeholders
// ─────────────────────────────────────────────

// ── Market overview cards ──────────────────────
export const marketOverview = [
  {
    id: "sp500",
    symbol: "S&P 500",
    name: "S&P 500 Index",
    price: 5187.67,
    change: 28.45,
    changePct: 0.55,
    trend: "up",
  },
  {
    id: "nasdaq",
    symbol: "NASDAQ",
    name: "NASDAQ Composite",
    price: 16274.94,
    change: -42.18,
    changePct: -0.26,
    trend: "down",
  },
  {
    id: "btc",
    symbol: "BTC/USD",
    name: "Bitcoin",
    price: 67842.0,
    change: 1234.5,
    changePct: 1.85,
    trend: "up",
  },
  {
    id: "eth",
    symbol: "ETH/USD",
    name: "Ethereum",
    price: 3521.4,
    change: -88.2,
    changePct: -2.44,
    trend: "down",
  },
];

// ── Stock price history (30 days) ─────────────
const generatePriceHistory = (base, volatility = 5) => {
  let price = base;
  return Array.from({ length: 30 }, (_, i) => {
    price += (Math.random() - 0.48) * volatility;
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000 + 1000000),
    };
  });
};

export const stockHistories = {
  AAPL: generatePriceHistory(170, 4),
  MSFT: generatePriceHistory(415, 6),
  NVDA: generatePriceHistory(880, 20),
  TSLA: generatePriceHistory(175, 12),
  GOOGL: generatePriceHistory(165, 5),
  AMZN: generatePriceHistory(185, 6),
  META: generatePriceHistory(510, 8),
  NFLX: generatePriceHistory(620, 15),
  AMD:  generatePriceHistory(175, 10),
  INTC: generatePriceHistory(42,  3),
};

// ── Full stock details ─────────────────────────
export const stockDetails = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    marketCap: "2.63T",
    pe: 27.4,
    eps: 6.43,
    week52High: 199.62,
    week52Low: 164.08,
    avgVolume: "58.3M",
    dividend: "0.25",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    sector: "Technology",
    marketCap: "3.08T",
    pe: 36.2,
    eps: 11.45,
    week52High: 430.82,
    week52Low: 309.45,
    avgVolume: "22.1M",
    dividend: "0.75",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    marketCap: "2.17T",
    pe: 68.9,
    eps: 12.96,
    week52High: 974.0,
    week52Low: 403.0,
    avgVolume: "41.8M",
    dividend: "0.04",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    marketCap: "555B",
    pe: 42.1,
    eps: 4.30,
    week52High: 299.29,
    week52Low: 138.80,
    avgVolume: "98.6M",
    dividend: "—",
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    marketCap: "2.04T",
    pe: 24.8,
    eps: 6.52,
    week52High: 191.75,
    week52Low: 120.21,
    avgVolume: "24.9M",
    dividend: "—",
  },
};

// ── AI Recommendations ─────────────────────────
export const aiRecommendations = [
  {
    id: "rec_001",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    recommendation: "BUY",
    confidence: 94,
    riskLevel: "Medium",
    targetPrice: 1050.0,
    currentPrice: 880.0,
    upside: 19.3,
    aiAnalysis:
      "NVIDIA's dominant position in AI accelerator chips and continued data center growth present a compelling buying opportunity. Strong earnings momentum and expanding software ecosystem (CUDA, NIM) support sustained premium valuation. Short-term volatility expected around earnings.",
    timestamp: "2024-03-15T10:30:00Z",
    blockchainTxHash: "0x3a8f9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
    blockchainStatus: "Verified",
    modelVersion: "SecureStock-AI v3.2",
  },
  {
    id: "rec_002",
    symbol: "AAPL",
    name: "Apple Inc.",
    recommendation: "HOLD",
    confidence: 78,
    riskLevel: "Low",
    targetPrice: 195.0,
    currentPrice: 170.0,
    upside: 14.7,
    aiAnalysis:
      "Apple's ecosystem lock-in and services growth remain strengths. However, near-term headwinds from China revenue softness and a maturing smartphone market limit significant upside. Watch for Vision Pro adoption curves and AI feature integration in iOS 18.",
    timestamp: "2024-03-15T09:15:00Z",
    blockchainTxHash: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    blockchainStatus: "Verified",
    modelVersion: "SecureStock-AI v3.2",
  },
  {
    id: "rec_003",
    symbol: "TSLA",
    name: "Tesla Inc.",
    recommendation: "SELL",
    confidence: 82,
    riskLevel: "High",
    targetPrice: 140.0,
    currentPrice: 175.0,
    upside: -20.0,
    aiAnalysis:
      "Increasing EV competition from BYD and legacy automakers, combined with margin compression from multiple price cuts, creates significant downside risk. FSD progress slower than anticipated. Energy division growth partially offsets automotive concerns but insufficient at current valuation.",
    timestamp: "2024-03-14T14:45:00Z",
    blockchainTxHash: "0x9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0",
    blockchainStatus: "Verified",
    modelVersion: "SecureStock-AI v3.1",
  },
  {
    id: "rec_004",
    symbol: "MSFT",
    name: "Microsoft Corp.",
    recommendation: "BUY",
    confidence: 91,
    riskLevel: "Low",
    targetPrice: 470.0,
    currentPrice: 415.0,
    upside: 13.3,
    aiAnalysis:
      "Azure's AI integration through Copilot products and OpenAI partnership provides multiple growth vectors. Enterprise software moat remains unmatched. Cloud margins expanding as infrastructure investments mature. Regulatory overhang largely priced in.",
    timestamp: "2024-03-14T11:00:00Z",
    blockchainTxHash: "0x4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3",
    blockchainStatus: "Verified",
    modelVersion: "SecureStock-AI v3.2",
  },
  {
    id: "rec_005",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    recommendation: "BUY",
    confidence: 87,
    riskLevel: "Medium",
    targetPrice: 200.0,
    currentPrice: 165.0,
    upside: 21.2,
    aiAnalysis:
      "Google Cloud accelerating with AI workloads. Search business proving resilient to AI disruption with Gemini integration. YouTube Shorts monetization ramping. Antitrust cases are a risk, but core business momentum is strong. Trading at discount to peers.",
    timestamp: "2024-03-13T16:20:00Z",
    blockchainTxHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
    blockchainStatus: "Pending",
    modelVersion: "SecureStock-AI v3.2",
  },
  {
    id: "rec_006",
    symbol: "META",
    name: "Meta Platforms Inc.",
    recommendation: "BUY",
    confidence: 89,
    riskLevel: "Medium",
    targetPrice: 600.0,
    currentPrice: 510.0,
    upside: 17.6,
    aiAnalysis:
      "Advertising revenue rebound is robust, with AI-powered ad targeting delivering measurable ROI for advertisers. Reality Labs losses are stabilizing. WhatsApp and Instagram monetization still early innings. Llama open-source strategy building developer goodwill.",
    timestamp: "2024-03-13T09:30:00Z",
    blockchainTxHash: "0x2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1",
    blockchainStatus: "Verified",
    modelVersion: "SecureStock-AI v3.1",
  },
];

// ── Blockchain transaction records ─────────────
export const blockchainRecords = aiRecommendations.map((rec) => ({
  recommendationId: rec.id,
  symbol: rec.symbol,
  txHash: rec.blockchainTxHash,
  blockNumber: Math.floor(Math.random() * 1000000 + 19000000),
  timestamp: rec.timestamp,
  network: "Ethereum Mainnet",
  contractAddress: "0xSecureStockAI_SmartContract_v2_0xabcdef1234",
  gasUsed: Math.floor(Math.random() * 50000 + 21000),
  confirmations: Math.floor(Math.random() * 100 + 50),
  status: rec.blockchainStatus,
  dataHash: `sha256:${Math.random().toString(36).substr(2, 40)}`,
}));

// ── Recommendation history table ──────────────
export const recommendationHistory = [
  ...aiRecommendations,
  {
    id: "rec_007",
    symbol: "AMD",
    name: "Advanced Micro Devices",
    recommendation: "BUY",
    confidence: 85,
    riskLevel: "Medium",
    timestamp: "2024-03-12T10:00:00Z",
    blockchainStatus: "Verified",
    blockchainTxHash: "0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
  },
  {
    id: "rec_008",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    recommendation: "BUY",
    confidence: 88,
    riskLevel: "Low",
    timestamp: "2024-03-12T08:30:00Z",
    blockchainStatus: "Verified",
    blockchainTxHash: "0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
  },
  {
    id: "rec_009",
    symbol: "NFLX",
    name: "Netflix Inc.",
    recommendation: "HOLD",
    confidence: 72,
    riskLevel: "Medium",
    timestamp: "2024-03-11T14:00:00Z",
    blockchainStatus: "Verified",
    blockchainTxHash: "0x8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7",
  },
  {
    id: "rec_010",
    symbol: "INTC",
    name: "Intel Corporation",
    recommendation: "SELL",
    confidence: 79,
    riskLevel: "High",
    timestamp: "2024-03-11T09:00:00Z",
    blockchainStatus: "Failed",
    blockchainTxHash: "0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
  },
];

// ── Notifications ─────────────────────────────
export const notifications = [
  {
    id: 1,
    type: "recommendation",
    message: "New AI recommendation for NVDA: BUY with 94% confidence",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "blockchain",
    message: "Blockchain verification confirmed for rec_004 (MSFT)",
    time: "15 min ago",
    read: false,
  },
  {
    id: 3,
    type: "alert",
    message: "TSLA dropped 3.2% – review current SELL recommendation",
    time: "1 hr ago",
    read: true,
  },
  {
    id: 4,
    type: "system",
    message: "SecureStock AI model updated to v3.2 – enhanced accuracy",
    time: "3 hr ago",
    read: true,
  },
];

// ── Dashboard chart data (7-day index trend) ──
export const dashboardChartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    sp500: parseFloat((5000 + Math.sin(i * 0.4) * 120 + i * 6 + Math.random() * 40).toFixed(2)),
    nasdaq: parseFloat((15500 + Math.sin(i * 0.3) * 300 + i * 18 + Math.random() * 100).toFixed(2)),
    btc: parseFloat((60000 + Math.sin(i * 0.5) * 3000 + i * 150 + Math.random() * 500).toFixed(2)),
  };
});

// ── User profile (mock session) ──────────────
export const currentUser = {
  id: "usr_001",
  name: "Alex Morgan",
  email: "alex.morgan@securestock.ai",
  avatar: null,
  plan: "Pro",
  joinDate: "2023-08-12",
};
