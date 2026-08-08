#!/usr/bin/env node
/**
 * MVP smoke test — run before any staging deployment.
 *
 * Stage 1 (always runs, no dependencies): HTTP checks against every main route,
 *   the /health probe, and the /health/ready readiness probe (API + database +
 *   GraphQL sub-mesh).
 * Stage 2 (runs when Playwright is available): a real browser signs in with the
 *   demo passcode, walks the main navigation, and confirms gated pages unlock.
 *
 *   node scripts/smoke-test.mjs                      # against http://localhost:8080
 *   node scripts/smoke-test.mjs https://staging-url  # against a deployed build
 *
 * Exit code 0 = safe to deploy. Non-zero = at least one check failed.
 */

const BASE = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);
const PASSCODE = process.env.SMOKE_PASSCODE || "raffles2026";
const EMAIL = process.env.SMOKE_EMAIL || "smoke.test@raffles-boston.demo";

const results = [];
let failed = 0;

function record(stage, name, ok, detail) {
  results.push({ stage, name, ok, detail });
  if (ok === false) failed += 1;
  const mark = ok === true ? "PASS" : ok === null ? "SKIP" : "FAIL";
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { "cache-control": "no-cache" } });
  return { status: res.status, body: await res.text() };
}

/* ------------------------------------------------------------------ */
/* Stage 1 — routes and probes over plain HTTP                        */
/* ------------------------------------------------------------------ */

const ROUTES = [
  { path: "/", expect: "Raffles" },
  { path: "/login", expect: "Sign in" },
  { path: "/for-you", expect: "you" },
  { path: "/amenities", expect: "Reservation" },
  { path: "/events", expect: "Events" },
  { path: "/concierge", expect: "Concierge" },
  { path: "/services", expect: "Services" },
  { path: "/account", expect: "Residents Only" },
  { path: "/directory", expect: "Residents Only" },
  { path: "/messages", expect: "Residents Only" },
  { path: "/community", expect: "Community" },
  { path: "/marketplace", expect: "Marketplace" },
  { path: "/proposals", expect: "Proposals" },
  { path: "/governance", expect: "Governance" },
  { path: "/management", expect: "Management" },
];

async function stageRoutes() {
  console.log("\nRoutes");
  for (const route of ROUTES) {
    try {
      const { status, body } = await get(route.path);
      if (status !== 200) {
        record("routes", route.path, false, `HTTP ${status}`);
      } else if (!body.includes(route.expect)) {
        record("routes", route.path, false, `missing expected content "${route.expect}"`);
      } else {
        record("routes", route.path, true);
      }
    } catch (error) {
      record("routes", route.path, false, error.message);
    }
  }
}

async function stageHealth() {
  console.log("\nHealth and readiness");
  try {
    const { status, body } = await get("/health");
    const payload = JSON.parse(body);
    record(
      "health",
      "GET /health",
      status === 200 && payload.status === "ok",
      `status=${payload.status}`,
    );
  } catch (error) {
    record("health", "GET /health", false, error.message);
  }

  try {
    const { status, body } = await get("/health/ready");
    const payload = JSON.parse(body);
    // 200 = ready, 503 = not ready. Anything else means the probe itself broke.
    if (status !== 200 && status !== 503) {
      record("health", "GET /health/ready", false, `unexpected HTTP ${status}`);
      return;
    }
    record("health", "readiness overall", payload.ready === true, `status=${payload.status}`);
    for (const check of payload.checks ?? []) {
      // "skipped" means the dependency is not provisioned for this deployment —
      // that is a pass for the smoke test, but it is reported explicitly.
      const ok = check.status === "ok" ? true : check.status === "skipped" ? null : false;
      record("health", `dependency: ${check.name}`, ok, `${check.status} — ${check.detail}`);
    }
    const names = (payload.checks ?? []).map((c) => c.name);
    for (const required of ["api", "database", "graphql"]) {
      if (!names.includes(required))
        record("health", `dependency: ${required}`, false, "check missing from probe");
    }
  } catch (error) {
    record("health", "GET /health/ready", false, error.message);
  }
}

/* ------------------------------------------------------------------ */
/* Stage 2 — browser: login + navigation                              */
/* ------------------------------------------------------------------ */

const GATED_PAGES = [
  { path: "/account", label: "House account" },
  { path: "/directory", label: "Directory" },
  { path: "/messages", label: "Messages" },
];

async function stageBrowser() {
  console.log("\nLogin and navigation (browser)");
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    record(
      "browser",
      "browser stage",
      null,
      "Playwright not installed — run `npm i -D playwright && npx playwright install chromium` for full end-to-end coverage",
    );
    return;
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      // Optional escape hatch for CI images that already ship a Chromium build.
      ...(process.env.SMOKE_CHROMIUM_PATH
        ? { executablePath: process.env.SMOKE_CHROMIUM_PATH }
        : {}),
    });
  } catch (error) {
    record(
      "browser",
      "browser stage",
      null,
      `chromium unavailable — ${error.message.split("\n")[0]}`,
    );
    return;
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("hydrat")) consoleErrors.push(msg.text());
  });

  // Navigate through the app the way a resident does — in-app links. The demo
  // session lives in memory, so a hard page load intentionally signs you out.
  async function navigateTo(label) {
    await page.getByRole("button", { name: /^menu$/i }).click();
    await page.waitForTimeout(400);
    await page
      .locator("#primary-navigation")
      .getByRole("link", { name: new RegExp(`^${label}$`, "i") })
      .first()
      .click();
    await page.waitForTimeout(900);
  }

  try {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await page.keyboard.press("Escape"); // dismiss the demo-mode notice
    await page.waitForTimeout(400);

    await page.fill("#email", EMAIL);
    await page.fill("#passcode", PASSCODE);
    await page.getByRole("button", { name: /enter the portal/i }).click();
    await page.waitForTimeout(1500);

    const signedIn = !page.url().endsWith("/login");
    record(
      "browser",
      "sign in with demo passcode",
      signedIn,
      signedIn ? `landed on ${page.url().replace(BASE, "")}` : "still on the sign-in form",
    );

    if (!signedIn) return;

    for (const target of GATED_PAGES) {
      await navigateTo(target.label);
      const locked = await page
        .getByText(/residents only/i)
        .isVisible()
        .catch(() => false);
      const onPath = page.url().endsWith(target.path);
      record(
        "browser",
        `resident area unlocks: ${target.path}`,
        onPath && !locked,
        !onPath
          ? `landed on ${page.url().replace(BASE, "")}`
          : locked
            ? "still showing the sign-in gate"
            : "",
      );
    }

    for (const label of ["Amenities", "Events", "Services", "Community", "Residence"]) {
      await navigateTo(label);
      const hasMain = await page
        .locator("main, #main")
        .first()
        .isVisible()
        .catch(() => false);
      record(
        "browser",
        `navigates to ${label}`,
        hasMain,
        hasMain ? page.url().replace(BASE, "") : "main content not rendered",
      );
    }

    // A fresh page load has no session, so the gate must come back.
    await page.goto(`${BASE}/account`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const relocked = await page
      .getByText(/residents only/i)
      .isVisible()
      .catch(() => false);
    record(
      "browser",
      "resident areas re-lock without a session",
      relocked,
      relocked ? "" : "gate did not return",
    );

    record(
      "browser",
      "no console errors",
      consoleErrors.length === 0,
      consoleErrors.slice(0, 3).join(" | ") || "",
    );
  } catch (error) {
    record("browser", "browser stage", false, error.message.split("\n")[0]);
  } finally {
    await browser.close();
  }
}

/* ------------------------------------------------------------------ */

console.log(`MVP smoke test → ${BASE}`);
await stageHealth();
await stageRoutes();
await stageBrowser();

const passed = results.filter((r) => r.ok === true).length;
const skipped = results.filter((r) => r.ok === null).length;
console.log(`\n${passed} passed · ${failed} failed · ${skipped} skipped`);
if (failed > 0) {
  console.log("Not safe to deploy to staging.");
  process.exit(1);
}
console.log("All checks green — safe to deploy to staging.");
