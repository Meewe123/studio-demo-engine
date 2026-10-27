/**
 * Скриншоты и видео авто-тура для README (на английском).
 *
 *   node scripts/readme-media.mts --base http://localhost:3000
 *
 * Кладёт PNG и tour.webm в docs/media/. Запускать на прод-сервере.
 */
import { mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const base = arg("base", "http://localhost:3000")!;
const tourSeconds = Number(arg("tour", "45"));

const SHOTS = [
  { name: "pitch-desktop", path: "/demo/black-star", size: [1440, 900], wait: 1500 },
  { name: "client-app-mobile", path: "/demo/black-star/app", size: [390, 844], wait: 1000 },
  { name: "owner-panel", path: "/demo/black-star/admin", size: [1440, 900], wait: 1000 },
  { name: "tv-board", path: "/demo/black-star/board", size: [1920, 1080], wait: 2500 },
] as const;

async function main() {
  const out = join(process.cwd(), "docs", "media");
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch();

  for (const shot of SHOTS) {
    const [width, height] = shot.size;
    const mobile = width < 768;
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: mobile ? 2 : 1,
      isMobile: mobile,
      hasTouch: mobile,
      locale: "en-US",
    });
    const page = await context.newPage();
    await page.goto(`${base}${shot.path}?lang=en`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(shot.wait);
    await page.screenshot({ path: join(out, `${shot.name}.png`) });
    console.log(shot.name);
    await context.close();
  }

  const videoDir = join(out, "video-tmp");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(`${base}/demo/black-star?tour=1&lang=en`, { waitUntil: "networkidle" });
  await page.waitForTimeout(tourSeconds * 1000);
  const video = page.video();
  await context.close();
  if (video) {
    await rename(await video.path(), join(out, "tour.webm"));
    console.log("tour.webm");
  }
  await rm(videoDir, { recursive: true, force: true });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
