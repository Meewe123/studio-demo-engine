/**
 * Сквозной сценарий клиента Black Star на телефоне: главная → услуга → время → номер → талон → «Готово».
 * Проверяет, что путь проходится без тупиков, и снимает каждый шаг.
 *
 *   node scripts/flow.ts --label flow --cpu 4
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const base = arg("base", "http://localhost:3000")!;
const label = arg("label", "flow")!;
const cpu = Number(arg("cpu", "1"));
const path = arg("path", "/demo/black-star/app")!;

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

  const t0 = Date.now();
  const shot = async (name: string) => {
    await page.waitForTimeout(450);
    await page.screenshot({ path: join(out, `${name}.png`) });
    console.log(`${name.padEnd(14)} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  };
  const tap = async (tour: string) => {
    const el = page.locator(`[data-tour="${tour}"]:visible`).first();
    await el.waitFor({ state: "visible", timeout: 8000 });
    await el.click();
  };

  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  if (path !== "/demo/black-star/app") {
    const tryIt = page.getByRole("button", { name: /Попробовать самому/ });
    if (await tryIt.isVisible().catch(() => false)) await tryIt.click();
  }
  await shot("01-home");
  await tap("pick-time");
  await shot("02-service");
  await tap("service-complex");
  await shot("03-time");
  await tap("slot-first");
  await shot("04-car");
  await tap("confirm");
  await page.waitForTimeout(1200);
  await shot("05-ticket");
  await tap("fast-forward");
  await page.waitForTimeout(4500);
  await shot("06-washing");
  await page.locator('[data-tour="again"]:visible').waitFor({ timeout: 20000 });
  await shot("07-ready");
  console.log(`total ${((Date.now() - t0) / 1000).toFixed(1)}s, errors: ${errors.length}`);
  errors.slice(0, 10).forEach((e) => console.log("  !", e.slice(0, 300)));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
