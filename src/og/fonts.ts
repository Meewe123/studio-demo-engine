import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** TTF для next/og (Satori не читает woff2). Урезаны до латиницы, кириллицы, ʻ и типографских знаков. */
const dir = join(process.cwd(), "src/og/fonts");

export async function ogFonts() {
  const [black, medium, mono] = await Promise.all([
    readFile(join(dir, "Unbounded-Black.ttf")),
    readFile(join(dir, "Unbounded-Medium.ttf")),
    readFile(join(dir, "SourceCodePro-SemiBold.ttf")),
  ]);
  return [
    { name: "Unbounded", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Unbounded", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Source Code Pro", data: mono, weight: 600 as const, style: "normal" as const },
  ];
}
