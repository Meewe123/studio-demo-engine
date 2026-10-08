/**
 * Lighthouse (mobile) по ключевым страницам. Запускайте на прод-сервере: npm run build && npm start.
 *
 *   node scripts/lighthouse.mts --paths /demo/black-star,/demo/black-star/app
 *
 * Браузер — headless shell из Playwright (npx playwright install chromium).
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const base = arg("base", "http://localhost:3000")!;
const paths = arg("paths", "/demo/black-star,/demo/black-star/app")!.split(",");

function findShell(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(homedir(), process.platform === "win32" ? "AppData/Local/ms-playwright" : ".cache/ms-playwright");
  if (!existsSync(root)) return undefined;
  const dir = readdirSync(root).find((d) => d.startsWith("chromium_headless_shell"));
  if (!dir) return undefined;
  const exe = process.platform === "win32" ? "chrome-headless-shell-win64/chrome-headless-shell.exe" : "chrome-headless-shell-linux64/chrome-headless-shell";
  const full = join(root, dir, exe);
  return existsSync(full) ? full : undefined;
}

async function main() {
  const out = join(process.cwd(), "review", "lighthouse");
  await mkdir(out, { recursive: true });
  const shell = findShell();
  const env = { ...process.env, ...(shell ? { CHROME_PATH: shell } : {}) };
  for (const path of paths) {
    const name = path.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";
    const file = join(out, `${name}.json`);
    execSync(
      `npx --yes lighthouse@12 "${base + path}" --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices --output=json --output-path="${file}"`,
      { stdio: "inherit", env },
    );
    const r = JSON.parse(await readFile(file, "utf8"));
    const s = (k: string) => Math.round((r.categories[k]?.score ?? 0) * 100);
    const a = (k: string) => r.audits[k]?.displayValue ?? "";
    console.log(
      `${path}  perf=${s("performance")} a11y=${s("accessibility")} bp=${s("best-practices")}  FCP=${a("first-contentful-paint")} LCP=${a("largest-contentful-paint")} TBT=${a("total-blocking-time")} CLS=${a("cumulative-layout-shift")}`,
    );
    for (const [id, audit] of Object.entries<{ score: number | null; title: string; scoreDisplayMode: string }>(r.audits)) {
      if (audit.score !== null && audit.score < 0.9 && !["informative", "manual", "notApplicable"].includes(audit.scoreDisplayMode)) {
        console.log(`   - ${id}: ${audit.title} (${audit.score})`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
