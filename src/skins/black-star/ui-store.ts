"use client";

import { create } from "zustand";

export type Screen = "home" | "service" | "time" | "car" | "ticket";

interface ClientUi {
  screen: Screen;
  branch: string;
  service: string | null;
  day: 0 | 1;
  slot: number | null;
  plate: string;
  notify: "telegram" | "sms";
  go(screen: Screen): void;
  set(patch: Partial<Omit<ClientUi, "go" | "set" | "reset">>): void;
  reset(branch: string): void;
}

export const DEFAULT_PLATE = "01 A 123 BC";

/** Состояние экранов клиента — локально для вкладки, не синхронизируется. */
export const useClientUi = create<ClientUi>()((set) => ({
  screen: "home",
  branch: "",
  service: null,
  day: 0,
  slot: null,
  plate: DEFAULT_PLATE,
  notify: "telegram",
  go: (screen) => set({ screen }),
  set: (patch) => set(patch),
  reset: (branch) => set({ screen: "home", branch, service: null, day: 0, slot: null, plate: DEFAULT_PLATE, notify: "telegram" }),
}));
