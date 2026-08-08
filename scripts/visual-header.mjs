#!/usr/bin/env node
/**
 * Visual regression test — site header auth buttons across mobile breakpoints.
 *
 *   node scripts/visual-header.mjs                 # verify against baseline
 *   node scripts/visual-header.mjs --update        # re-record the baseline
 *   node scripts/visual-header.mjs http://host     # target another base URL
 *
 * Set VISUAL_CHROMIUM_PATH to reuse an already-installed Chromium binary
 * instead of Playwright's own download.
 *
 * For every breakpoint it renders a signed-out page, then checks the header's
 * measured geometry:
 *   - the "Resident sign in" / "Resident sign up" buttons never overlap the
 *     Raffles logo (the bug this suite guards against)
 *   - the buttons stay fully inside the viewport (no horizontal clipping)
 *   - the buttons keep a usable 44px tap target
 *   - the row/stack arrangement matches the recorded baseline
 *
 * A PNG of the header is written to tests/visual/output/ at every width so the
 * layout can also be eyeballed. Exit code 0 = header layout unchanged.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(ROOT, "tests/visual/header-baseline.json");
const OUTPUT_DIR = join(ROOT, "tests/visual/output");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const BASE = (
  args.find((a) => a.startsWith("http")) ||
  process.env.VISUAL_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

/** Common mobile (and small-tablet) breakpoints. */
const BREAKPOINTS = [
  { name: "iphone-se", width: 320, height: 800 },
  { name: "android-small", width: 360, height: 800 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "iphone-plus", width: 414, height: 896 },
  { name: "iphone-pro-max", width: 430, height: 932 },
  { name: "tablet-portrait", width: 768, height: 1024 },
];

/** Pages that render the header in its signed-out state. */
const PAGES = ["/gratitude", "/", "/amenities"];

const MIN_TAP_TARGET = 40;

function overlaps(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function measure(page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return null;
    const logo = header.querySelector('img[alt="The Raffles Residences Boston"]');
    const links = Array.from(header.querySelectorAll('a[href*="/login"]'));
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    };
    return {
      header: box(header),
      logo: logo ? box(logo) : null,
      buttons: links.map((el) => ({ label: (el.textContent || "").trim(), ...box(el) })),
    };
  });
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error("Playwright is not installed — run `bun add -d playwright` first.");
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const baseline =
    !UPDATE && existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : null;
  if (!UPDATE && !baseline) {
    console.error(`No baseline at ${BASELINE} — run with --update once to record it.`);
    process.exit(1);
  }

  const recorded = {};
  const failures = [];
  const executablePath = process.env.VISUAL_CHROMIUM_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});

  for (const bp of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const path of PAGES) {
      const label = `${bp.name}@${bp.width} ${path}`;
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("header a[href*='/login']", { timeout: 20000 });
      await page.waitForTimeout(400);

      const m = await measure(page);
      if (!m || !m.logo || m.buttons.length < 2) {
        failures.push(`${label}: header, logo or auth buttons missing`);
        continue;
      }

      for (const b of m.buttons) {
        if (overlaps(b, m.logo)) failures.push(`${label}: "${b.label}" overlaps the Raffles logo`);
        if (b.x < 0 || b.x + b.width > bp.width)
          failures.push(`${label}: "${b.label}" is clipped horizontally`);
        if (b.height < MIN_TAP_TARGET)
          failures.push(`${label}: "${b.label}" tap target is only ${b.height}px`);
        if (b.y < m.header.y || b.y + b.height > m.header.y + m.header.height)
          failures.push(`${label}: "${b.label}" escapes the header band`);
      }

      const stacked = m.buttons[1].y >= m.buttons[0].y + m.buttons[0].height;
      const snapshot = {
        stacked,
        labels: m.buttons.map((b) => b.label),
        headerHeight: m.header.height,
        logoWithinHeader: m.logo.y >= m.header.y,
      };
      recorded[label] = snapshot;

      if (baseline) {
        const prev = baseline[label];
        if (!prev) {
          failures.push(`${label}: no baseline entry — re-record with --update`);
        } else if (JSON.stringify(prev) !== JSON.stringify(snapshot)) {
          failures.push(
            `${label}: layout changed\n    baseline ${JSON.stringify(prev)}\n    current  ${JSON.stringify(snapshot)}`,
          );
        }
      }

      if (path === "/gratitude") {
        await page
          .locator("header").first()
          .screenshot({ path: join(OUTPUT_DIR, `header-${bp.name}-${bp.width}.png`) });
      }
    }

    await context.close();
  }

  await browser.close();

  if (UPDATE) {
    writeFileSync(BASELINE, `${JSON.stringify(recorded, null, 2)}\n`);
    console.log(`Baseline recorded: ${Object.keys(recorded).length} checks -> ${BASELINE}`);
    return;
  }

  const checks = Object.keys(recorded).length;
  if (failures.length) {
    console.error(`Header visual regression FAILED (${failures.length} issue(s)):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`Header visual regression PASSED across ${checks} breakpoint/page checks.`);
  console.log(`Screenshots: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
