export const locales = ["ru", "uz", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Как язык называет сам себя — для переключателя. */
export const localeLabels: Record<Locale, { short: string; full: string }> = {
  ru: { short: "Рус", full: "Русский" },
  uz: { short: "Oʻzb", full: "Oʻzbekcha" },
  en: { short: "Eng", full: "English" },
};
