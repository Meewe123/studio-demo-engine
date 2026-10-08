"use client";

import { useSyncExternalStore } from "react";

/** matchMedia как хук. На сервере возвращает fallback. */
export function useMedia(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/** Слабое устройство: здесь не включаем WebGL и тяжёлые эффекты. */
export function isLowPower(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if ((nav.hardwareConcurrency ?? 2) <= 4) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return true;
  return false;
}
