"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import type { BrandData } from "@/engine/brand-data";
import { useBrand } from "@/engine/brand-context";
import { NORMAL_SPEED, rebase, simNow, type Clock } from "@/engine/sim/clock";
import { Rng } from "@/engine/sim/rng";

/**
 * Модель «живой жизни» бренда: начальное состояние и шаг симуляции.
 * Состояние — простые данные, чтобы его можно было сохранить и передать в другую вкладку.
 */
export interface DemoModel<S> {
  key: string;
  version: number;
  seed: number;
  start: number;
  init(brand: BrandData, seed: number): { state: S; rng: number };
  step(state: S, brand: BrandData, rng: Rng, from: number, to: number, realDt: number): void;
}

interface Snapshot<S> {
  v: number;
  rev: number;
  savedAt: number;
  clock: Clock;
  rng: number;
  model: S;
}

export interface ActCtx {
  rng: Rng;
  brand: BrandData;
  now: number;
}

export interface DemoState<S> extends Snapshot<S> {
  /** Текущее время демо в минутах. Обновляется 4 раза в секунду. */
  now: number;
  /** true после монтирования на клиенте: часы идут, данные из localStorage подхвачены. */
  live: boolean;
  act(fn: (model: S, ctx: ActCtx) => void): void;
  setSpeed(speed: number): void;
  jumpTo(minute: number): void;
  reset(): void;
}

const STALE_AFTER = 30 * 60 * 1000;
const TICK = 250;

function storageKey(model: DemoModel<unknown>, slug: string) {
  return `demo:${slug}:${model.key}:v${model.version}`;
}

function readSaved<S>(key: string): Snapshot<S> | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Snapshot<S>) : null;
  } catch {
    return null;
  }
}

function writeSaved<S>(key: string, snap: Snapshot<S>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(snap));
  } catch {
    /* приватный режим или запрет хранилища — демо работает в памяти */
  }
}

function snapshotOf<S>(s: DemoState<S>): Snapshot<S> {
  return { v: s.v, rev: s.rev, savedAt: s.savedAt, clock: s.clock, rng: s.rng, model: s.model };
}

function create<S>(model: DemoModel<S>, brand: BrandData) {
  const fresh = model.init(brand, model.seed);
  return createStore<DemoState<S>>()((set, get) => ({
    v: model.version,
    rev: 0,
    savedAt: 0,
    // До монтирования часы стоят: сервер и первый рендер клиента совпадают.
    clock: { base: model.start, anchor: 0, speed: 0 },
    rng: fresh.rng,
    model: fresh.state,
    now: model.start,
    live: false,
    act(fn) {
      const s = get();
      const draft = structuredClone(s.model);
      const rng = new Rng(s.rng);
      fn(draft, { rng, brand, now: s.now });
      set({ model: draft, rng: rng.s, rev: Date.now(), savedAt: Date.now() });
    },
    setSpeed(speed) {
      const s = get();
      set({ clock: rebase(s.clock, Date.now(), { speed }), rev: Date.now() });
    },
    jumpTo(minute) {
      const s = get();
      set({ clock: rebase(s.clock, Date.now(), { base: minute }), rev: Date.now() });
    },
    reset() {
      const init = model.init(brand, model.seed);
      const now = Date.now();
      set({ model: init.state, rng: init.rng, clock: { base: model.start, anchor: now, speed: NORMAL_SPEED }, now: model.start, rev: now, savedAt: now });
    },
  }));
}

const StoreContext = createContext<StoreApi<DemoState<unknown>> | null>(null);

export function DemoStoreProvider<S>({ model, children }: { model: DemoModel<S>; children: ReactNode }) {
  const brand = useBrand();
  const [store] = useState(() => create(model, brand));

  useEffect(() => {
    const key = storageKey(model as DemoModel<unknown>, brand.slug);
    const saved = readSaved<S>(key);
    const realNow = Date.now();
    if (saved && saved.v === model.version && realNow - saved.savedAt < STALE_AFTER) {
      store.setState({ ...saved, now: simNow(saved.clock, realNow), live: true });
    } else {
      store.setState({ clock: { base: model.start, anchor: realNow, speed: NORMAL_SPEED }, rev: realNow, savedAt: realNow, live: true });
    }

    // Симуляцию двигает одна вкладка (лидер), остальные получают снимки.
    let leader = false;
    let disposed = false;
    let release: (() => void) | undefined;
    const lockAbort = new AbortController();
    const canSync = typeof navigator !== "undefined" && "locks" in navigator;
    if (canSync) {
      navigator.locks
        .request(`leader:${key}`, { signal: lockAbort.signal }, () => {
          if (disposed) return;
          leader = true;
          return new Promise<void>((resolve) => (release = resolve));
        })
        .catch(() => {
          // AbortError при размонтировании — это нормально; иначе считаем себя лидером.
          if (!disposed) leader = true;
        });
    } else {
      leader = true;
    }

    let channel: BroadcastChannel | null = null;
    try {
      channel = canSync && "BroadcastChannel" in window ? new BroadcastChannel(key) : null;
    } catch {
      channel = null;
    }

    const accept = (snap: Snapshot<S>) => {
      const s = store.getState();
      if (snap.v === s.v && snap.rev > s.rev) store.setState({ ...snap, now: simNow(snap.clock, Date.now()) });
    };
    if (channel) channel.onmessage = (e: MessageEvent<Snapshot<S>>) => accept(e.data);
    const onStorage = (e: StorageEvent) => {
      if (!canSync || e.key !== key || !e.newValue || channel) return;
      try {
        accept(JSON.parse(e.newValue) as Snapshot<S>);
      } catch {
        /* битый снимок пропускаем */
      }
    };
    window.addEventListener("storage", onStorage);

    let lastReal = realNow;
    let lastSent = 0;
    let lastRev = store.getState().rev;
    const id = window.setInterval(() => {
      const s = store.getState();
      const t = Date.now();
      const to = Math.min(simNow(s.clock, t), s.now + 24 * 60);
      if (leader) {
        const draft = structuredClone(s.model);
        const rng = new Rng(s.rng);
        model.step(draft, brand, rng, s.now, to, (t - lastReal) / 1000);
        store.setState({ model: draft, rng: rng.s, now: to, rev: Math.max(t, s.rev + 1), savedAt: t });
      } else {
        store.setState({ now: to });
      }
      lastReal = t;
      const after = store.getState();
      if (after.rev !== lastRev && t - lastSent > 900) {
        lastSent = t;
        lastRev = after.rev;
        const snap = snapshotOf(after);
        writeSaved(key, snap);
        channel?.postMessage(snap);
      }
    }, TICK);

    // Действия пользователя рассылаем сразу, не дожидаясь тика.
    const unsub = store.subscribe((s, prev) => {
      if (s.rev !== prev.rev && s.now === prev.now) {
        const snap = snapshotOf(s);
        writeSaved(key, snap);
        channel?.postMessage(snap);
      }
    });

    return () => {
      disposed = true;
      lockAbort.abort();
      window.clearInterval(id);
      window.removeEventListener("storage", onStorage);
      unsub();
      channel?.close();
      release?.();
    };
  }, [store, model, brand]);

  return <StoreContext.Provider value={store as StoreApi<DemoState<unknown>>}>{children}</StoreContext.Provider>;
}

export function useDemoApi<S>(): StoreApi<DemoState<S>> {
  const store = useContext(StoreContext);
  if (!store) throw new Error("DemoStoreProvider is missing");
  return store as StoreApi<DemoState<S>>;
}

/** Селектор должен возвращать стабильное значение (поле стора), производные считайте в useMemo. */
export function useDemo<S, T>(selector: (s: DemoState<S>) => T): T {
  return useStore(useDemoApi<S>(), selector);
}
