#!/usr/bin/env node
/**
 * Accessibility smoke test — automated WCAG 2.2 AA audit via axe-core.
 *
 *   node scripts/a11y-audit.mjs                      # against http://localhost:8080
 *   node scripts/a11y-audit.mjs https://staging-url  # against a deployed build
 *
 * Loads every main public route plus the signed-in resident areas (via the
 * demo passcode, same as scripts/smoke-test.mjs) and runs an axe-core scan
 * scoped to WCAG 2.0/2.1/2.2 A & AA rules on each one — the same bar the
 * README claims the app meets.
 *
 * "serious"/"critical" violations fail the run (exit 1). "moderate"/"minor"
 * findings are printed but don't fail the build — they're worth a look but
 * are frequently subjective or content-driven in a demo dataset.
 *
 * Exit code 0 = no serious/critical accessibility violations found.
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = (process.argv[2] || process.env.A11Y_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);
const PASSCODE = process.env.SMOKE_PASSCODE || "raffles2026";
const EMAIL = process.env.SMOKE_EMAIL || "a11y.audit@raffles-boston.demo";
// Any non-empty value works for a guest passcode sign-in — the sign-in form
// requires a residence number, but doesn't validate it against a real unit.
const UNIT = process.env.SMOKE_UNIT || "19C";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const FAILING_IMPACT = new Set(["serious", "critical"]);

const results = [];
let failed = 0;

function record(page, ok, detail) {
  results.push({ page, ok, detail });
  if (ok === false) failed += 1;
  const mark = ok === true ? "PASS" : ok === null ? "WARN" : "FAIL";
  console.log(`  [${mark}] ${page}${detail ? ` — ${detail}` : ""}`);
}

/** Signed-out pages — no session required. */
const PUBLIC_PAGES = [
  "/",
  "/login",
  "/amenities",
  "/events",
  "/concierge",
  "/services",
  "/community",
  "/marketplace",
  "/proposals",
  "/governance",
  "/management",
  "/hotel-bridge",
  "/gallery",
  "/gratitude",
  "/about-raffles",
  "/press",
  "/sales-and-leasing",
  "/privacy",
  "/terms",
];

/** Resident-only pages, scanned after signing in with the demo passcode. */
const GATED_PAGES = ["/account", "/directory", "/messages"];

async function scan(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#main-content", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(300);

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const blocking = violations.filter((v) => FAILING_IMPACT.has(v.impact ?? ""));
  const advisory = violations.filter((v) => !FAILING_IMPACT.has(v.impact ?? ""));

  for (const v of blocking) {
    console.log(`      ✗ [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
    console.log(`        ${v.helpUrl}`);
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`        - ${node.target.join(" ")}`);
    }
  }

  if (blocking.length > 0) {
    record(path, false, `${blocking.length} serious/critical violation(s)`);
  } else if (advisory.length > 0) {
    record(
      path,
      null,
      `clean at serious/critical — ${advisory.length} moderate/minor advisory finding(s)`,
    );
    for (const v of advisory) {
      console.log(`      · [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
    }
  } else {
    record(path, true);
  }
}

async function signIn(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.keyboard.press("Escape"); // dismiss the demo-mode notice
  await page.waitForTimeout(300);
  await page.fill("#email", EMAIL);
  await page.fill("#signin-unit", UNIT);
  await page.fill("#password", PASSCODE);
  await page.getByRole("button", { name: /enter the portal/i }).click();
  await page.waitForTimeout(1500);
  return !page.url().endsWith("/login");
}

async function main() {
  console.log(`Accessibility audit (WCAG 2.0/2.1/2.2 A/AA via axe-core) → ${BASE}`);

  const browser = await chromium.launch({
    headless: true,
    ...(process.env.A11Y_CHROMIUM_PATH ? { executablePath: process.env.A11Y_CHROMIUM_PATH } : {}),
  });

  try {
    console.log("\nPublic pages");
    // @axe-core/playwright needs a page from an explicit context — the
    // browser.newPage() shorthand creates a single-owner context that
    // AxeBuilder's internals can't share, and throws when it tries to.
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const page = await context.newPage();
    for (const path of PUBLIC_PAGES) {
      try {
        await scan(page, path);
      } catch (error) {
        record(path, false, error.message.split("\n")[0]);
      }
    }

    console.log("\nResident areas (signed in with the demo passcode)");
    const signedIn = await signIn(page).catch(() => false);
    if (!signedIn) {
      record("sign-in", false, "could not sign in with the demo passcode — gated pages skipped");
    } else {
      for (const path of GATED_PAGES) {
        try {
          await scan(page, path);
        } catch (error) {
          record(path, false, error.message.split("\n")[0]);
        }
      }
    }
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.ok === true).length;
  const warned = results.filter((r) => r.ok === null).length;
  console.log(`\n${passed} clean · ${failed} failed · ${warned} advisory-only`);
  if (failed > 0) {
    console.log("Serious/critical accessibility violations found — fix before shipping.");
    process.exit(1);
  }
  console.log("No serious/critical accessibility violations found.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
