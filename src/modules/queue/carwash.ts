import type { BrandData } from "@/engine/brand-data";
import { Rng } from "@/engine/sim/rng";

/*
 * Очередь мойки по слотам. Время — минуты демо (см. engine/sim/clock).
 * Посты, расписание и номера машин — генерируются детерминированно из seed.
 */

export const OPEN = 8 * 60;
export const CLOSE = 23 * 60;
export const START = 17 * 60 + 52;
export const SLOT_STEP = 20;
/** Минимальный запас до слота: записаться «на сейчас» нельзя. */
export const LEAD = 15;
/** Подготовка поста между машинами. */
export const PREP = 5;
/** Сколько минут готовая машина стоит на посту до выдачи. */
export const PICKUP = 4;

export type Stage = "waiting" | "intake" | "foam" | "wash" | "dry" | "ready" | "done";
export const WASH_STAGES = ["intake", "foam", "wash", "dry", "ready"] as const;
const SPLITS: [Exclude<Stage, "waiting" | "ready" | "done">, number][] = [
  ["intake", 0.08],
  ["foam", 0.3],
  ["wash", 0.72],
  ["dry", 1],
];

export type CarSource = "online" | "walkin" | "you";
export type CarStatus = "booked" | "active" | "ready" | "done";

export interface Car {
  id: string;
  plate: string;
  service: string;
  branch: string;
  post: number;
  slot: number;
  dur: number;
  source: CarSource;
  status: CarStatus;
  start?: number;
  ready?: number;
}

export type FeedKind = "booked" | "ready" | "started" | "walkin";

export interface FeedItem {
  id: string;
  at: number;
  kind: FeedKind;
  plate: string;
  branch: string;
  time?: number;
  post?: number;
  you?: boolean;
}

export interface CarwashState {
  day: number;
  seq: number;
  cars: Car[];
  feed: FeedItem[];
  done: Record<string, number>;
  you?: string;
  readyNotice?: { carId: string; at: number };
}

const PLATE_LETTERS = "ABCDEHKMOPTXYZ";

export function randomPlate(rng: Rng): string {
  const region = rng.pick(["01", "01", "01", "10", "10", "40", "30", "70"]);
  return `${region} ${rng.pick([...PLATE_LETTERS])} ${rng.int(100, 999)} ${rng.pick([...PLATE_LETTERS])}${rng.pick([...PLATE_LETTERS])}`;
}

function ceilTo(value: number, step: number): number {
  return Math.ceil(value / step - 1e-9) * step;
}

function pickService(brand: BrandData, rng: Rng, minuteOfDay: number) {
  const weights = [0.35, 0.4, 0.2, 0.05];
  const options = brand.services.map((s, i) => [s, weights[i] ?? 0.05] as const).filter(([s]) => s.duration < 120 || minuteOfDay < 19 * 60);
  return rng.weighted(options);
}

function occupied(car: Car): [number, number] | null {
  if (car.status === "done") return null;
  if (car.status === "ready") return [car.ready ?? car.slot, (car.ready ?? car.slot) + PICKUP];
  if (car.status === "active") return [car.start ?? car.slot, (car.start ?? car.slot) + car.dur + PREP];
  return [car.slot, car.slot + car.dur + PREP];
}

/** Свободный пост на интервал [start, start + dur), или null. */
export function freePost(state: CarwashState, branch: string, capacity: number, start: number, dur: number): number | null {
  for (let post = 1; post <= capacity; post++) {
    const clash = state.cars.some((car) => {
      if (car.branch !== branch || car.post !== post) return false;
      const span = occupied(car);
      return span !== null && span[0] < start + dur + PREP && start < span[1];
    });
    if (!clash) return post;
  }
  return null;
}

function addFeed(state: CarwashState, item: Omit<FeedItem, "id">) {
  state.feed = [{ ...item, id: `f${state.seq++}` }, ...state.feed].slice(0, 40);
}

function seedDay(state: CarwashState, brand: BrandData, rng: Rng, day: number, from: number) {
  for (const branch of brand.branches) {
    for (let post = 1; post <= branch.capacity; post++) {
      let t: number;
      if (day === 0) {
        const svc = pickService(brand, rng, from);
        const progress = 0.1 + rng.next() * 0.75;
        const start = from - progress * svc.duration;
        state.cars.push({
          id: `c${state.seq++}`,
          plate: randomPlate(rng),
          service: svc.id,
          branch: branch.id,
          post,
          slot: Math.round(start),
          dur: svc.duration,
          source: rng.chance(0.7) ? "online" : "walkin",
          status: "active",
          start,
        });
        t = ceilTo(start + svc.duration + PREP, 10);
        // На последнем посту оставляем окно в ближайший час: так выглядит обычный вечер.
        if (post === branch.capacity) t = Math.max(t, ceilTo(from + LEAD, SLOT_STEP)) + SLOT_STEP * 3;
      } else {
        t = day * 1440 + OPEN + rng.int(0, 2) * 10;
      }
      const close = day * 1440 + CLOSE;
      while (t + 20 <= close) {
        if (rng.chance(0.32)) {
          t += rng.pick([20, 20, 40]);
          continue;
        }
        const svc = pickService(brand, rng, t - day * 1440);
        if (t + svc.duration > close) break;
        state.cars.push({
          id: `c${state.seq++}`,
          plate: randomPlate(rng),
          service: svc.id,
          branch: branch.id,
          post,
          slot: t,
          dur: svc.duration,
          source: rng.chance(0.72) ? "online" : "walkin",
          status: "booked",
        });
        t = ceilTo(t + svc.duration + PREP, 10);
      }
    }
  }
}

export function initCarwash(brand: BrandData, seed: number): { state: CarwashState; rng: number } {
  const rng = new Rng(seed);
  const state: CarwashState = { day: 0, seq: 1, cars: [], feed: [], done: {} };
  brand.branches.forEach((b, i) => (state.done[b.id] = [31, 24, 18][i] ?? 20));
  seedDay(state, brand, rng, 0, START);

  // Лента пульта не пустая с первой секунды: несколько событий последних минут.
  for (const branch of brand.branches) {
    const here = state.cars.filter((c) => c.branch === branch.id);
    const active = here.filter((c) => c.status === "active").sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
    const booked = here.filter((c) => c.status === "booked" && c.source === "online").slice(-3);
    const events: Omit<FeedItem, "id">[] = [
      ...active.map((c) => ({ at: c.start ?? START, kind: "started" as const, plate: c.plate, branch: branch.id, post: c.post })),
      { at: START - 9, kind: "ready", plate: randomPlate(rng), branch: branch.id, post: 1 },
      ...booked.map((c, i) => ({ at: START - 6 + i * 2, kind: "booked" as const, plate: c.plate, branch: branch.id, time: c.slot, post: c.post })),
    ];
    events.sort((a, b) => a.at - b.at).forEach((e) => addFeed(state, e));
  }
  return { state, rng: rng.s };
}

function stepAt(state: CarwashState, brand: BrandData, rng: Rng, t: number) {
  const dayIndex = Math.floor((t - OPEN) / 1440);
  if (dayIndex > state.day) {
    state.cars = state.cars.filter((c) => c.status !== "done");
    state.day = dayIndex;
    for (const b of brand.branches) state.done[b.id] = 0;
    seedDay(state, brand, rng, dayIndex, dayIndex * 1440 + OPEN);
  }

  for (const car of state.cars) {
    if (car.status === "active" && car.start !== undefined && t >= car.start + car.dur) {
      car.status = "ready";
      car.ready = car.start + car.dur;
      addFeed(state, { at: car.ready, kind: "ready", plate: car.plate, branch: car.branch, post: car.post, you: car.source === "you" });
      if (car.source === "you") state.readyNotice = { carId: car.id, at: car.ready };
    } else if (car.status === "ready" && car.ready !== undefined && t >= car.ready + PICKUP && car.source !== "you") {
      car.status = "done";
      state.done[car.branch] = (state.done[car.branch] ?? 0) + 1;
    }
  }

  for (const branch of brand.branches) {
    for (let post = 1; post <= branch.capacity; post++) {
      const busy = state.cars.some((c) => c.branch === branch.id && c.post === post && (c.status === "active" || c.status === "ready"));
      if (busy) continue;
      let next: Car | undefined;
      for (const c of state.cars) {
        if (c.branch === branch.id && c.post === post && c.status === "booked" && c.slot <= t + 0.5 && (!next || c.slot < next.slot)) next = c;
      }
      if (next) {
        next.status = "active";
        next.start = Math.max(t, next.slot);
        addFeed(state, { at: next.start, kind: "started", plate: next.plate, branch: next.branch, post, you: next.source === "you" });
      }
    }
  }
}

/** Продвинуть симуляцию от from до to. Большие прыжки идут поминутно, чтобы ничего не пропустить. */
export function stepCarwash(state: CarwashState, brand: BrandData, rng: Rng, from: number, to: number, realDt: number): void {
  if (to - from > 1.5) {
    for (let t = from + 1; t < to; t += 1) stepAt(state, brand, rng, t);
  }
  stepAt(state, brand, rng, to);

  // Новые онлайн-записи приходят в реальном времени: в среднем раз в 25 секунд.
  if (realDt > 0 && rng.chance(Math.min(1, realDt / 25))) {
    const branch = rng.pick(brand.branches);
    const svc = pickService(brand, rng, to % 1440);
    let t = ceilTo(to + LEAD + rng.int(0, 6) * 20, SLOT_STEP);
    while (t + svc.duration <= state.day * 1440 + CLOSE) {
      const post = freePost(state, branch.id, branch.capacity, t, svc.duration);
      if (post !== null) {
        const car: Car = {
          id: `c${state.seq++}`,
          plate: randomPlate(rng),
          service: svc.id,
          branch: branch.id,
          post,
          slot: t,
          dur: svc.duration,
          source: "online",
          status: "booked",
        };
        state.cars.push(car);
        addFeed(state, { at: to, kind: "booked", plate: car.plate, branch: branch.id, time: t, post });
        break;
      }
      t += SLOT_STEP;
    }
  }
}

/* ---------- Действия ---------- */

export function bookYours(
  state: CarwashState,
  brand: BrandData,
  input: { branch: string; service: string; slot: number; plate: string },
  now: number,
): Car | null {
  const branch = brand.branches.find((b) => b.id === input.branch);
  const svc = brand.services.find((s) => s.id === input.service);
  if (!branch || !svc) return null;
  cancelYours(state);
  const post = freePost(state, branch.id, branch.capacity, input.slot, svc.duration);
  if (post === null) return null;
  const car: Car = {
    id: `c${state.seq++}`,
    plate: input.plate,
    service: svc.id,
    branch: branch.id,
    post,
    slot: input.slot,
    dur: svc.duration,
    source: "you",
    status: "booked",
  };
  state.cars.push(car);
  state.you = car.id;
  state.readyNotice = undefined;
  addFeed(state, { at: now, kind: "booked", plate: car.plate, branch: branch.id, time: input.slot, post, you: true });
  return car;
}

export function cancelYours(state: CarwashState): void {
  if (!state.you) return;
  state.cars = state.cars.filter((c) => c.id !== state.you || c.status === "done");
  state.you = undefined;
  state.readyNotice = undefined;
}

/** Клиент забрал машину — талон закрывается. */
export function pickUpYours(state: CarwashState): void {
  const car = state.cars.find((c) => c.id === state.you);
  if (car) {
    car.status = "done";
    state.done[car.branch] = (state.done[car.branch] ?? 0) + 1;
  }
  state.you = undefined;
  state.readyNotice = undefined;
}

/** «Позвать следующего»: если пост свободен, ставим ближайшую машину по записи. */
export function callNext(state: CarwashState, branch: string, post: number, now: number): boolean {
  const busy = state.cars.some((c) => c.branch === branch && c.post === post && (c.status === "active" || c.status === "ready"));
  if (busy) {
    const ready = state.cars.find((c) => c.branch === branch && c.post === post && c.status === "ready");
    if (!ready) return false;
    ready.status = "done";
    state.done[branch] = (state.done[branch] ?? 0) + 1;
  }
  const candidates = state.cars
    .filter((c) => c.branch === branch && c.status === "booked" && c.slot <= now + 60)
    .sort((a, b) => (a.post === post ? -1 : 0) - (b.post === post ? -1 : 0) || a.slot - b.slot);
  const next = candidates[0];
  if (!next) return false;
  next.post = post;
  next.status = "active";
  next.start = now;
  addFeed(state, { at: now, kind: "started", plate: next.plate, branch, post, you: next.source === "you" });
  return true;
}

/** Машина без записи встаёт в ближайшее свободное окно — порядок не ломается. */
export function walkIn(state: CarwashState, brand: BrandData, rng: Rng, branchId: string, now: number): Car | null {
  const branch = brand.branches.find((b) => b.id === branchId);
  if (!branch) return null;
  const svc = brand.services[rng.chance(0.6) ? 0 : 1];
  let t = ceilTo(now + 5, 10);
  while (t + svc.duration <= state.day * 1440 + CLOSE) {
    const post = freePost(state, branch.id, branch.capacity, t, svc.duration);
    if (post !== null) {
      const car: Car = {
        id: `c${state.seq++}`,
        plate: randomPlate(rng),
        service: svc.id,
        branch: branch.id,
        post,
        slot: t,
        dur: svc.duration,
        source: "walkin",
        status: "booked",
      };
      state.cars.push(car);
      addFeed(state, { at: now, kind: "walkin", plate: car.plate, branch: branch.id, time: t, post });
      return car;
    }
    t += 10;
  }
  return null;
}

/* ---------- Чтение ---------- */

export function progressOf(car: Car, now: number): number {
  if (car.status === "booked") return 0;
  if (car.status === "ready" || car.status === "done") return 1;
  return Math.min(1, Math.max(0, (now - (car.start ?? now)) / car.dur));
}

export function stageOf(car: Car, now: number): Stage {
  if (car.status === "booked") return "waiting";
  if (car.status === "ready") return "ready";
  if (car.status === "done") return "done";
  const p = progressOf(car, now);
  return SPLITS.find(([, until]) => p < until)?.[0] ?? "dry";
}

export function etaOf(car: Car, now: number): number {
  if (car.status === "booked") return Math.max(0, Math.ceil(car.slot + car.dur - now));
  if (car.status !== "active") return 0;
  return Math.max(1, Math.ceil((car.start ?? now) + car.dur - now));
}

export interface PostView {
  post: number;
  car?: Car;
  next?: Car;
}

export function postsOf(state: CarwashState, branch: string, capacity: number): PostView[] {
  return Array.from({ length: capacity }, (_, i) => {
    const post = i + 1;
    const here = state.cars.filter((c) => c.branch === branch && c.post === post);
    const car = here.find((c) => c.status === "active") ?? here.find((c) => c.status === "ready");
    const next = here.filter((c) => c.status === "booked").sort((a, b) => a.slot - b.slot)[0];
    return { post, car, next };
  });
}

export function upcoming(state: CarwashState, branch: string, limit: number): Car[] {
  return state.cars
    .filter((c) => c.branch === branch && c.status === "booked")
    .sort((a, b) => a.slot - b.slot)
    .slice(0, limit);
}

export function slotsFor(state: CarwashState, branch: { id: string; capacity: number }, dur: number, now: number, day: 0 | 1) {
  const base = (state.day + day) * 1440;
  const from = day === 0 ? ceilTo(now + LEAD, SLOT_STEP) : base + 9 * 60;
  const out: { t: number; free: boolean }[] = [];
  for (let t = from; t + dur <= base + CLOSE; t += SLOT_STEP) {
    let free: boolean;
    if (day === 0) free = freePost(state, branch.id, branch.capacity, t, dur) !== null;
    // Завтрашнее расписание ещё не сгенерировано — показываем правдоподобную занятость.
    else free = (Math.floor(t / SLOT_STEP) * 7 + branch.capacity) % 3 !== 0;
    out.push({ t, free });
  }
  return out;
}

export function kpisOf(state: CarwashState, branch: { id: string; capacity: number }) {
  const today = state.cars.filter((c) => c.branch === branch.id && c.status !== "booked");
  const active = today.filter((c) => c.status === "active").length;
  const started = today.filter((c) => c.start !== undefined);
  const lag = started.length ? started.reduce((sum, c) => sum + Math.max(0, (c.start ?? 0) - c.slot), 0) / started.length : 0;
  const all = state.cars.filter((c) => c.branch === branch.id);
  const online = all.filter((c) => c.source !== "walkin").length;
  return {
    cars: (state.done[branch.id] ?? 0) + today.filter((c) => c.status !== "done").length,
    wait: Math.max(3, Math.round(lag + 3)),
    load: Math.round((active / branch.capacity) * 100),
    online: all.length ? Math.round((online / all.length) * 100) : 0,
  };
}
