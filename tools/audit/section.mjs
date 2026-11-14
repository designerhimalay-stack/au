import { BASE as REGION_BASE } from "../region/base.mjs";
// Usage: node tools/audit/section.mjs <path> <selector> <name> [widths=1440,1024,390]
// Screenshots one section of the dev site at each width (reduced motion, so
// reveals and word fills settle) into tools/audit/out/<name>-<width>.png.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [, , path = "/", selector = "main", name = "section", widths = "1440,1024,390"] = process.argv;
const out = fileURLToPath(new URL("./out/", import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
for (const w of widths.split(",").map(Number)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:4321${REGION_BASE.replace(/\/$/, "")}${path}`, { waitUntil: "networkidle" });
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await el.screenshot({ path: `${out}${name}-${w}.png` });
  console.log(`${name}-${w}.png`, overflow > 0 ? `OVERFLOW ${overflow}px` : "no overflow", errors.length ? errors : "");
  await ctx.close();
}
await browser.close();
