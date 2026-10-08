/**
 * Проверка авто-тура: открывает ?tour=1 и снимает кадр каждые N секунд.
 *
 *   node scripts/tour.mts --label tour --width 1440
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const base = arg("base", "http://localhost:3000")!;
const label = arg("label", "tour")!;
const width = Number(arg("width", "1440"));
const every = Number(arg("every", "4"));
const total = Number(arg("total", "44"));
const cpu = Number(arg("cpu", "1"));
const slug = arg("slug", "black-star")!;

async function main() {
  const out = join(process.cwd(), "review", label);
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch();
  const mobile = width < 768;
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 844 : 900 },
    isMobile: mobile,
    hasTouch: mobile,
    locale: "ru-RU",
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  if (cpu > 1) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  }
  await page.goto(`${base}/demo/${slug}?tour=1`, { waitUntil: "networkidle" });
  const t0 = Date.now();
  for (let s = 0; s <= total; s += every) {
    const wait = t0 + s * 1000 - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    const caption = await page
      .locator("[data-tour-hud] p")
      .first()
      .textContent()
      .catch(() => "");
    await page.screenshot({ path: join(out, `${String(s).padStart(2, "0")}s-${width}.png`) });
    console.log(`${String(s).padStart(2, "0")}s  ${caption?.trim().slice(0, 80) ?? ""}`);
  }
  const ended = await page
    .getByRole("dialog", { name: /Так может работать|could work|ishlashi mumkin/ })
    .isVisible()
    .catch(() => false);
  console.log(`end card: ${ended}, errors: ${errors.length}`);
  errors.slice(0, 8).forEach((e) => console.log("  !", e.slice(0, 300)));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
