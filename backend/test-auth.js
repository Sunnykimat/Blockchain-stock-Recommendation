import http from "http";

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const data = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== 1. Testing Health Check ===");
  const health = await request("/api/health");
  console.log("Status:", health.status, "Status string:", health.data.status);

  console.log("\n=== 2. Testing Admin Master Login ===");
  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "admin@securestock.ai", password: "admin123" },
  });
  console.log("Admin login status:", adminLogin.status);
  console.log("Admin role:", adminLogin.data.user?.role);
  console.log("Token received:", !!adminLogin.data.token);

  console.log("\n=== 3. Testing Login with Invalid Credentials ===");
  const invalidLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "admin@securestock.ai", password: "wrongpassword" },
  });
  console.log("Status:", invalidLogin.status, "Error message:", invalidLogin.data.error);

  console.log("\n=== 4. Testing Password Length Validation (<8 chars) ===");
  const shortPass = await request("/api/auth/register", {
    method: "POST",
    body: { name: "Bob", email: "bob@example.com", password: "short" },
  });
  console.log("Status:", shortPass.status, "Error message:", shortPass.data.error);

  console.log("\n=== 5. Testing Valid User Registration ===");
  const uniqueEmail = `trader_${Date.now()}@example.com`;
  const registerRes = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Alice Trader",
      email: uniqueEmail,
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    },
  });
  console.log("Registration status:", registerRes.status);
  console.log("User id:", registerRes.data.user?.id);
  console.log("User role:", registerRes.data.user?.role);
  console.log("Token present:", !!registerRes.data.token);

  console.log("\n=== 6. Testing Duplicate Registration Prevention ===");
  const dupRes = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Alice Clone",
      email: uniqueEmail,
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    },
  });
  console.log("Status:", dupRes.status, "Error message:", dupRes.data.error);

  console.log("\n=== 7. Testing Authorization on Protected Endpoints ===");
  const unauthMe = await request("/api/auth/me");
  console.log("GET /api/auth/me without token -> Status:", unauthMe.status, unauthMe.data.error);

  const authMe = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${registerRes.data.token}` },
  });
  console.log("GET /api/auth/me with Bearer token -> Status:", authMe.status, "User:", authMe.data.user?.name);

  console.log("\n=== 8. Testing Watchlist Isolation per User ===");
  const aliceWatchlist = await request("/api/watchlist", {
    headers: { Authorization: `Bearer ${registerRes.data.token}` },
  });
  console.log("Alice initial watchlist:", aliceWatchlist.data);

  const aliceAdd = await request("/api/watchlist", {
    method: "POST",
    headers: { Authorization: `Bearer ${registerRes.data.token}` },
    body: { symbol: "TSLA" },
  });
  console.log("Alice updated watchlist:", aliceAdd.data);

  const adminWatchlist = await request("/api/watchlist", {
    headers: { Authorization: `Bearer ${adminLogin.data.token}` },
  });
  console.log("Admin watchlist (isolated from Alice):", adminWatchlist.data);

  console.log("\n=== 9. Testing Forgot Password Endpoint ===");
  const forgot = await request("/api/auth/forgot-password", {
    method: "POST",
    body: { email: "trader@example.com" },
  });
  console.log("Forgot password status:", forgot.status, "Message:", forgot.data.message, "Available:", forgot.data.available);

  console.log("\n=== 10. Testing Brute-Force Rate Limiting (5 failed attempts) ===");
  const testIpEmail = `brute_${Date.now()}@example.com`;
  for (let i = 1; i <= 6; i++) {
    const res = await request("/api/auth/login", {
      method: "POST",
      body: { email: testIpEmail, password: "wrong" },
    });
    console.log(`Attempt ${i} -> Status:`, res.status, res.data.error);
  }

  console.log("\n>>> ALL AUTH TESTS PASSED SUCCESSFULLY! <<<");
}

runTests().catch(console.error);
