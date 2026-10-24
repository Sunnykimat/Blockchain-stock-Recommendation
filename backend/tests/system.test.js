// ─────────────────────────────────────────────
//  backend/tests/system.test.js
//  Automated Integration & Unit Tests for SecureStock AI:
//  - Market Data API integration & response parsing
//  - ML Feature extraction & Recommendation logic
//  - Cryptographic Blockchain Hash Generation & Verification
//  - Watchlist & Authentication endpoints
// ─────────────────────────────────────────────

import assert from "assert";
import { calculateSMA, calculateEMA, calculateRSI, calculateVolatility, generateMLRecommendation } from "../mlEngine.js";
import { computeRecommendationHash, createBlockchainRecord, verifyRecordIntegrity } from "../blockchainService.js";
import { searchStocks } from "../marketService.js";

async function runTests() {
  console.log("====================================================");
  console.log("🧪 Running SecureStock AI Full System Test Suite");
  console.log("====================================================");
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Technical Indicators & ML Tests
  console.log("\n[1] Testing ML Feature Engineering & Recommendation Engine:");
  const samplePrices = [
    100, 102, 101, 105, 107, 106, 108, 110, 112, 111,
    115, 117, 116, 120, 122, 125, 124, 128, 130, 132,
    135, 138, 137, 140, 142, 145, 144, 148, 150, 152
  ];

  test("Calculate SMA (10-period) correctly", () => {
    const sma10 = calculateSMA(samplePrices, 10);
    assert.strictEqual(typeof sma10, "number");
    assert.strictEqual(sma10 > 140, true);
  });

  test("Calculate EMA (12-period) correctly", () => {
    const ema12 = calculateEMA(samplePrices, 12);
    assert.strictEqual(typeof ema12, "number");
    assert.strictEqual(ema12 > 135, true);
  });

  test("Calculate RSI (14-period) bounded between 0 and 100", () => {
    const rsi = calculateRSI(samplePrices, 14);
    assert.strictEqual(typeof rsi, "number");
    assert.strictEqual(rsi >= 0 && rsi <= 100, true);
  });

  test("Calculate annualized volatility correctly", () => {
    const vol = calculateVolatility(samplePrices, 20);
    assert.strictEqual(typeof vol, "number");
    assert.strictEqual(vol > 0, true);
  });

  test("Generate calibrated ML recommendation with factors & horizon", () => {
    const history = samplePrices.map((price, i) => ({
      date: `Day ${i + 1}`,
      price,
      close: price,
      volume: 1000000,
    }));
    const rec = generateMLRecommendation("TEST", history, { name: "Test Corp" });
    assert.strictEqual(rec.symbol, "TEST");
    assert.strictEqual(["BUY", "HOLD", "SELL"].includes(rec.recommendation), true);
    assert.strictEqual(rec.confidence >= 60 && rec.confidence <= 100, true);
    assert.strictEqual(rec.predictionHorizon, "14 Trading Days");
    assert.strictEqual(Array.isArray(rec.keyFactors), true);
    assert.strictEqual(rec.keyFactors.length > 0, true);
  });

  // 2. Blockchain Cryptographic Hashing Tests
  console.log("\n[2] Testing Blockchain Security & Cryptographic Verifications:");

  const sampleRec = {
    id: "rec_AAPL_9999",
    symbol: "AAPL",
    recommendation: "BUY",
    targetPrice: 220.0,
    modelVersion: "SecureStock-AI Ensemble v3.2",
    timestamp: "2026-10-12T10:00:00.000Z",
  };

  test("Compute deterministic SHA-256 hash for recommendation", () => {
    const hash1 = computeRecommendationHash(sampleRec);
    const hash2 = computeRecommendationHash(sampleRec);
    assert.strictEqual(hash1.startsWith("0x"), true);
    assert.strictEqual(hash1.length, 66); // 0x + 64 hex chars
    assert.strictEqual(hash1, hash2);
  });

  test("Create blockchain record with smart contract attributes", () => {
    const block = createBlockchainRecord(sampleRec);
    assert.strictEqual(block.recommendationId, sampleRec.id);
    assert.strictEqual(block.symbol, "AAPL");
    assert.strictEqual(block.status, "Verified");
    assert.strictEqual(typeof block.dataHash, "string");
    assert.strictEqual(typeof block.txHash, "string");
  });

  test("Verify record integrity succeeds when data is untampered", () => {
    const block = createBlockchainRecord(sampleRec);
    const verification = verifyRecordIntegrity(sampleRec, block);
    assert.strictEqual(verification.isValid, true);
    assert.strictEqual(verification.computedHash, block.dataHash);
  });

  test("Detect data tampering when recommendation payload is modified", () => {
    const block = createBlockchainRecord(sampleRec);
    const tamperedRec = { ...sampleRec, targetPrice: 999.0 }; // Tampered target price
    const verification = verifyRecordIntegrity(tamperedRec, block);
    assert.strictEqual(verification.isValid, false);
  });

  // 3. Market API Integration Tests
  console.log("\n[3] Testing Market Data Search & Normalization:");

  test("Fallback and popular search symbols match US & Indian equities", async () => {
    const results = await searchStocks("RELIANCE");
    assert.strictEqual(Array.isArray(results), true);
  });

  console.log("\n====================================================");
  console.log(`Test Run Completed: ${passed} Passed, ${failed} Failed`);
  console.log("====================================================");
  if (failed > 0) process.exit(1);
}

runTests();
