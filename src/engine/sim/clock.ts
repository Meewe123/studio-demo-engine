/**
 * Часы демо. Время — в минутах от полуночи «сегодняшнего» дня демо (может уходить за 1440).
 * speed — сколько минут демо проходит за одну реальную секунду.
 */
export interface Clock {
  base: number;
  anchor: number;
  speed: number;
}

/** 1 минута демо = 10 реальных секунд: очередь заметно живая, но не мельтешит. */
export const NORMAL_SPEED = 0.1;

export function simNow(clock: Clock, realNow: number): number {
  return clock.base + ((realNow - clock.anchor) / 1000) * clock.speed;
}

export function rebase(clock: Clock, realNow: number, patch: Partial<Pick<Clock, "base" | "speed">>): Clock {
  return { base: patch.base ?? simNow(clock, realNow), anchor: realNow, speed: patch.speed ?? clock.speed };
}
