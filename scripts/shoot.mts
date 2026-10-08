/**
 * Скриншоты для визуальной самопроверки.
 *
 *   node scripts/shoot.ts --label before --only black-star
 *   node scripts/shoot.ts --label after --cpu 4 --base http://localhost:3000
 *
 * Кладёт PNG в review/<label>/<страница>-<ширина>.png
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Page } from "@playwright/test";

type Shot = { name: string; path: string; sizes: [number, number][]; full?: boolean; brand?: string; wait?: number };

const MOBILE: [number, number] = [390, 844];
const DESKTOP: [number, number] = [1440, 900];
const TV: [number, number] = [1920, 1080];

const SHOTS: Shot[] = [
  { name: "showcase", path: "/", sizes: [MOBILE, DESKTOP], full: true },
  { name: "styleguide", path: "/styleguide", sizes: [MOBILE, DESKTOP], full: true },
  { name: "bs-pitch", path: "/demo/black-star", sizes: [MOBILE, DESKTOP], full: true, brand: "black-star", wait: 1500 },
  { name: "bs-app", path: "/demo/black-star/app", sizes: [MOBILE], brand: "black-star", wait: 1000 },
  { name: "bs-admin", path: "/demo/black-star/admin", sizes: [MOBILE, DESKTOP], full: true, brand: "black-star", wait: 1000 },
  { name: "bs-board", path: "/demo/black-star/board", sizes: [TV], brand: "black-star", wait: 2500 },
];

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const base = arg("base", "http://localhost:3000")!;
const label = arg("label", "latest")!;
const only = arg("only");
const cpu = Number(arg("cpu", "1"));
const pick = arg("pick")?.split(",");

async function settle(page: Page, wait = 600) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(wait);
}

async function main() {
  const out = join(process.cwd(), "review", label);
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch();

  for (const shot of SHOTS) {
    if (only && shot.brand && shot.brand !== only) continue;
    if (pick && !pick.includes(shot.name)) continue;
    for (const [width, height] of shot.sizes) {
      const mobile = width < 768;
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        isMobile: mobile,
        hasTouch: mobile,
        locale: "ru-RU",
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();
      if (cpu > 1) {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      }
      const started = Date.now();
      await page.goto(base + shot.path, { waitUntil: "networkidle" });
      await settle(page, shot.wait);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = join(out, `${shot.name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: shot.full ?? false });
      console.log(`${shot.name}-${width}  ${Date.now() - started}ms  overflow-x=${overflow}px`);
      await context.close();
    }
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
