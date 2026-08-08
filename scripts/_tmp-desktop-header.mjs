import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1512, height: 950 }, deviceScaleFactor: 2 });
const page = await context.newPage();
await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const data = await page.evaluate(() => {
  const header = document.querySelector("header");
  const logo = header.querySelector('img[alt="The Raffles Residences Boston"]');
  const links = Array.from(header.querySelectorAll('a[href*="/login"]'));
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right };
  };
  return {
    header: box(header),
    logo: box(logo),
    buttons: links.map((el) => ({ label: el.textContent.trim(), ...box(el) })),
  };
});
console.log(JSON.stringify(data, null, 2));

await page.screenshot({ path: "/private/tmp/claude-501/-Users-ashleyromano-Desktop-ashleys-hobby-apps-Raffles-Residence-Hub/d59f88cb-3a20-4e9e-8cb0-91687a3fbd17/scratchpad/desktop-header-full.png" });
await page.locator("header").first().screenshot({ path: "/private/tmp/claude-501/-Users-ashleyromano-Desktop-ashleys-hobby-apps-Raffles-Residence-Hub/d59f88cb-3a20-4e9e-8cb0-91687a3fbd17/scratchpad/desktop-header.png" });

await browser.close();
