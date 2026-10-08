"use client";

import { createContext, useContext, useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { getWebApp, haptic, type TgWebApp } from "./webapp";

interface TelegramContextValue {
  /** Страница открыта как Mini App внутри Telegram. */
  app: TgWebApp | null;
  /** Приложение показано в рамке телефона на странице-презентации. */
  embedded: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({ app: null, embedded: false });

/**
 * В Mini App красим шапку и фон Telegram в цвет бренда (бренд важнее темы Telegram),
 * разворачиваем окно и сообщаем, что приложение готово.
 */
export function TelegramProvider({ bg, embedded = false, children }: { bg: string; embedded?: boolean; children: ReactNode }) {
  const [app, setApp] = useState<TgWebApp | null>(null);

  useEffect(() => {
    if (embedded) return;
    let tries = 0;
    const id = window.setInterval(() => {
      const found = getWebApp();
      if (found || ++tries > 20) window.clearInterval(id);
      if (!found) return;
      found.ready();
      found.expand();
      try {
        found.setHeaderColor(bg);
        found.setBackgroundColor(bg);
        found.setBottomBarColor?.(bg);
      } catch {
        /* старые клиенты Telegram */
      }
      setApp(found);
    }, 100);
    return () => window.clearInterval(id);
  }, [bg, embedded]);

  return <TelegramContext.Provider value={{ app: embedded ? null : app, embedded }}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  return useContext(TelegramContext);
}

/**
 * Главная кнопка экрана. В Mini App — нативная MainButton Telegram,
 * в браузере — кнопка бренда внизу экрана.
 */
export function PrimaryAction({
  label,
  onClick,
  disabled = false,
  tour,
  color,
  textColor,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tour?: string;
  color: string;
  textColor: string;
}) {
  const { app } = useTelegram();
  const fire = useEffectEvent(() => {
    haptic("medium");
    onClick();
  });

  useEffect(() => {
    if (!app) return;
    const cb = () => fire();
    app.MainButton.setParams({ text: label, color, text_color: textColor, is_active: !disabled, is_visible: true });
    app.MainButton.onClick(cb);
    return () => {
      app.MainButton.offClick(cb);
      app.MainButton.hide();
    };
  }, [app, label, disabled, color, textColor]);

  if (app) return null;
  return (
    <button
      type="button"
      className="btn"
      data-block
      data-tour={tour}
      disabled={disabled}
      onClick={() => {
        haptic("medium");
        onClick();
      }}
    >
      {label}
    </button>
  );
}

/** Назад: нативная BackButton в Mini App, иначе обычная кнопка, которую рисует экран. */
export function useBackButton(onBack: (() => void) | null) {
  const { app } = useTelegram();
  const hasBack = Boolean(onBack);
  const fire = useEffectEvent(() => onBack?.());
  useEffect(() => {
    if (!app || !hasBack) return;
    const cb = () => fire();
    app.BackButton.show();
    app.BackButton.onClick(cb);
    return () => {
      app.BackButton.offClick(cb);
      app.BackButton.hide();
    };
  }, [app, hasBack]);
  return { native: Boolean(app) };
}
