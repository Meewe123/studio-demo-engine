import type { Locale } from "@/i18n/config";

const intlLocale: Record<Locale, string> = { ru: "ru-RU", uz: "uz-Latn-UZ", en: "en-GB" };

/** 120000 → «120 000» с неразрывным пробелом (en — «120,000»). */
export function formatAmount(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(amount).replace(/ /g, " ");
}

/** Минуты от полуночи → «18:40». */
export function hhmm(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Подстановка {name} в строку из конфига бренда. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : `{${key}}`));
}
