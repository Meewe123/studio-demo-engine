import type { Locale } from "@/i18n/config";

const NBSP = " ";

const SHORT: Record<Locale, RegExp> = {
  // Предлоги, союзы и частицы из 1–3 букв не должны оставаться в конце строки.
  ru: /(^|[\s«(„])(в|во|к|ко|с|со|у|о|об|и|а|но|на|за|по|до|от|из|не|ни|без|для|при|про|над|под|что|как|или|уже|все|всё)\s+/giu,
  uz: /(^|[\s“(])(va|bu|u|har|eng|bir|har|endi)\s+/giu,
  en: /(^|[\s“(])(a|an|the|to|of|in|on|at|by|or|and|no|is|it|we|you)\s+/giu,
};

const UNITS = /(\d)\s+(мин|ч|с|сум|сек|%|daq|soat|son|soʻm|min|h|s|sum)(?=$|[\s.,;:!?)»”])/gu;

/**
 * Типографика для коротких текстов интерфейса:
 * неразрывный пробел перед тире, после коротких слов и между числом и единицей.
 */
export function typo(input: string, locale: Locale): string {
  let s = input;
  s = s.replace(/\.\.\./g, "…");
  if (locale === "ru") s = s.replace(/"([^"]*)"/g, "«$1»");
  s = s.replace(/ — /g, `${NBSP}— `);
  s = s.replace(/ – /g, `${NBSP}– `);
  s = s.replace(UNITS, `$1${NBSP}$2`);
  // Дважды: «в и на» — подряд идущие короткие слова.
  s = s.replace(SHORT[locale], `$1$2${NBSP}`);
  s = s.replace(SHORT[locale], `$1$2${NBSP}`);
  return s;
}

/** Применяет typo ко всем строкам дерева. */
export function typoTree<T>(tree: T, locale: Locale): T {
  if (typeof tree === "string") return typo(tree, locale) as T;
  if (Array.isArray(tree)) return tree.map((x) => typoTree(x, locale)) as T;
  if (tree && typeof tree === "object") {
    return Object.fromEntries(Object.entries(tree).map(([k, v]) => [k, typoTree(v, locale)])) as T;
  }
  return tree;
}
