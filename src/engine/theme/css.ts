import type { BrandTheme } from "@brands/types";
import { fontVar } from "./fonts";

/** Токены бренда → CSS-переменные. Имена совпадают с @theme в globals.css. */
export function themeVars(theme: BrandTheme): Record<string, string> {
  const { color, font, display, text, radius, line, shadow, motion, icon } = theme;
  return {
    "--c-bg": color.bg,
    "--c-surface": color.surface,
    "--c-raised": color.raised,
    "--c-line": color.line,
    "--c-ink": color.ink,
    "--c-muted": color.muted,
    "--c-accent": color.accent,
    "--c-on-accent": color.onAccent,
    "--c-accent-soft": color.accentSoft,
    "--c-signal": color.signal,
    "--c-on-signal": color.onSignal,
    "--c-mark": color.mark,
    "--c-focus": color.focus,
    "--f-display": fontVar(font.display),
    "--f-text": fontVar(font.text),
    "--f-mono": fontVar(font.mono),
    "--display-weight": String(display.weight),
    "--display-tracking": display.tracking,
    "--display-leading": String(display.leading),
    "--display-style": display.style,
    "--display-variation": display.variation ?? "normal",
    "--text-weight": String(text.weight),
    "--text-leading": String(text.leading),
    "--text-strong": String(text.strong),
    "--r-s": radius.s,
    "--r-m": radius.m,
    "--r-l": radius.l,
    "--w-hair": line.hair,
    "--w-rule": line.rule,
    "--sh-card": shadow.card,
    "--sh-pop": shadow.pop,
    "--ease": motion.ease,
    "--ease-out": motion.easeOut,
    "--dur-fast": `${motion.fast}ms`,
    "--dur-base": `${motion.base}ms`,
    "--dur-slow": `${motion.slow}ms`,
    "--icon-stroke": String(icon.stroke),
  };
}

export function themeCss(theme: BrandTheme, selector: string): string {
  const body = Object.entries(themeVars(theme))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `${selector}{${body};color-scheme:${theme.scheme}}`;
}
