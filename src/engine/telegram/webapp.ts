/**
 * Тонкая обёртка над window.Telegram.WebApp.
 * Вне Telegram (обычный браузер, превью в рамке телефона) все вызовы безопасно превращаются в фолбэки.
 */

type HapticImpact = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotice = "error" | "success" | "warning";

interface TgButton {
  text: string;
  isVisible: boolean;
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): TgButton;
  onClick(cb: () => void): TgButton;
  offClick(cb: () => void): TgButton;
  show(): TgButton;
  hide(): TgButton;
  enable(): TgButton;
  disable(): TgButton;
}

export interface TgWebApp {
  initData: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  ready(): void;
  expand(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  openTelegramLink(url: string): void;
  openLink(url: string): void;
  MainButton: TgButton;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback: {
    impactOccurred(style: HapticImpact): void;
    notificationOccurred(type: HapticNotice): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export const TELEGRAM_SCRIPT = "https://telegram.org/js/telegram-web-app.js";

/** WebApp только если страница действительно открыта как Mini App (есть initData). */
export function getWebApp(): TgWebApp | null {
  if (typeof window === "undefined") return null;
  const app = window.Telegram?.WebApp;
  return app && app.initData ? app : null;
}

export type Haptic = HapticImpact | HapticNotice | "select";

export function haptic(kind: Haptic = "light"): void {
  const app = getWebApp();
  try {
    if (app) {
      if (kind === "select") app.HapticFeedback.selectionChanged();
      else if (kind === "success" || kind === "error" || kind === "warning") app.HapticFeedback.notificationOccurred(kind);
      else app.HapticFeedback.impactOccurred(kind);
      return;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(kind === "success" ? [12, 60, 18] : kind === "error" ? [30, 40, 30] : 8);
    }
  } catch {
    /* вибрация недоступна — молча пропускаем */
  }
}

/** Открыть ссылку: внутри Telegram — нативно, иначе в новой вкладке. */
export function openExternal(url: string): void {
  const app = getWebApp();
  if (app) {
    if (url.startsWith("https://t.me/")) app.openTelegramLink(url);
    else app.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
