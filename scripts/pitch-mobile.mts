/**
 * Мобильная страница-презентации: обложка → приложение → «Владелец» → шторка «О демо».
 *
 *   node scripts/pitch-mobile.mts --label pitch-mobile --cpu 4
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const base = arg("base", "http://localhost:3000")!;
const label = arg("label", "pitch-mobile")!;
const cpu = Number(arg("cpu", "1"));
const slug = arg("slug", "black-star")!;
const lang = arg("lang", "ru")!;

async function main() {
  const out = join(process.cwd(), "review", label);
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "ru-RU" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  if (cpu > 1) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  }
  const shot = async (name: string) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(out, `${name}.png`) });
    console.log(name);
  };

  await page.goto(`${base}/demo/${slug}?lang=${lang}`, { waitUntil: "networkidle" });
  await shot("1-cover");
  await page.locator("[role=dialog] button").nth(1).click();
  await shot("2-client");
  await page.locator(".bs-dock .seg button").nth(1).click();
  await shot("3-owner");
  await page.locator(".bs-dock button[aria-label]").last().click();
  await shot("4-about");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`overflow-x=${overflow}px errors=${errors.length}`);
  errors.slice(0, 6).forEach((e) => console.log("  !", e.slice(0, 300)));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
