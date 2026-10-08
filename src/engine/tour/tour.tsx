"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type TourStep =
  | { do: "caption"; text: string | (() => string) }
  | { do: "view"; view: "client" | "owner" }
  | { do: "tap"; target: string; optional?: boolean }
  | { do: "point"; target: string }
  | { do: "wait"; ms: number }
  | { do: "until"; test: () => boolean; timeout: number }
  | { do: "run"; fn: () => void };

type Status = "idle" | "playing" | "paused" | "ended";

interface TourContextValue {
  status: Status;
  caption: string;
  step: number;
  total: number;
  start(): void;
  skip(): void;
  resume(): void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("TourProvider is missing");
  return ctx;
}

class Aborted extends Error {}

/** Плавное перемещение курсора. Таймер-страховка: в фоновой вкладке rAF спит, а тур идёт дальше. */
function glide(x: MotionValue<number>, y: MotionValue<number>, tx: number, ty: number, ms: number): Promise<void> {
  const fx = x.get();
  const fy = y.get();
  const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  return new Promise((resolve) => {
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      x.set(tx);
      y.set(ty);
      resolve();
    };
    const frame = (now: number) => {
      if (done) return;
      const p = Math.min(1, (now - start) / ms);
      x.set(fx + (tx - fx) * ease(p));
      y.set(fy + (ty - fy) * ease(p));
      if (p < 1) requestAnimationFrame(frame);
      else finish();
    };
    requestAnimationFrame(frame);
    setTimeout(finish, ms + 120);
  });
}

function findTarget(name: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`));
  return all.find((el) => el.getClientRects().length > 0 && !el.closest("[inert]")) ?? null;
}

/**
 * Авто-тур: курсор-призрак нажимает настоящие кнопки приложения, приходят уведомления,
 * двигается очередь. Любое касание пользователя ставит тур на паузу.
 */
export function TourProvider({
  build,
  prepare,
  onView,
  autoplay,
  touch,
  children,
}: {
  build: () => TourStep[];
  prepare: () => void;
  onView: (view: "client" | "owner") => void;
  autoplay: boolean;
  touch: boolean;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [caption, setCaption] = useState("");
  const [step, setStep] = useState(0);
  const [total, setTotal] = useState(0);
  const [cursorOn, setCursorOn] = useState(false);
  const [pressing, setPressing] = useState(0);
  const reduced = useReducedMotion();
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const run = useRef(0);
  const paused = useRef<{ resume: () => void } | null>(null);
  const pausedFlag = useRef(false);

  const gate = useCallback(async (id: number) => {
    if (run.current !== id) throw new Aborted();
    while (pausedFlag.current) {
      await new Promise<void>((resolve) => (paused.current = { resume: resolve }));
      if (run.current !== id) throw new Aborted();
    }
  }, []);

  const sleep = useCallback(
    async (ms: number, id: number) => {
      let left = ms;
      while (left > 0) {
        await gate(id);
        const chunk = Math.min(left, 100);
        await new Promise((r) => setTimeout(r, chunk));
        left -= chunk;
      }
      await gate(id);
    },
    [gate],
  );

  const moveTo = useCallback(
    async (el: HTMLElement, id: number) => {
      const scroller = el.closest<HTMLElement>("[data-tour-scroll]") ?? el.closest<HTMLElement>(".overflow-y-auto");
      if (scroller) {
        const r = el.getBoundingClientRect();
        const s = scroller.getBoundingClientRect();
        if (r.top < s.top + 40 || r.bottom > s.bottom - 40) {
          scroller.scrollTo({ top: scroller.scrollTop + (r.top - s.top) - s.height / 2 + r.height / 2, behavior: reduced ? "auto" : "smooth" });
          await sleep(380, id);
        }
      }
      const r = el.getBoundingClientRect();
      const tx = r.left + r.width / 2;
      const ty = r.top + r.height / 2;
      setCursorOn(true);
      if (reduced) {
        x.set(tx);
        y.set(ty);
        return;
      }
      if (x.get() < 0) {
        x.set(tx + 160);
        y.set(ty + 220);
      }
      await glide(x, y, tx, ty, 560);
      await gate(id);
    },
    [gate, reduced, sleep, x, y],
  );

  const play = useCallback(async () => {
    const id = ++run.current;
    pausedFlag.current = false;
    const steps = build();
    setTotal(steps.length);
    setStatus("playing");
    setCaption("");
    prepare();
    onView("client");
    try {
      await sleep(300, id);
      for (let i = 0; i < steps.length; i++) {
        await gate(id);
        setStep(i + 1);
        const s = steps[i];
        if (s.do === "caption") setCaption(typeof s.text === "function" ? s.text() : s.text);
        else if (s.do === "view") {
          onView(s.view);
          await sleep(450, id);
        } else if (s.do === "wait") await sleep(s.ms, id);
        else if (s.do === "run") s.fn();
        else if (s.do === "until") {
          const started = Date.now();
          while (!s.test() && Date.now() - started < s.timeout) await sleep(150, id);
        } else {
          let el = findTarget(s.target);
          for (let tries = 0; !el && tries < 20; tries++) {
            await sleep(100, id);
            el = findTarget(s.target);
          }
          if (!el) {
            if (s.do === "point" || s.optional) continue;
            break;
          }
          await moveTo(el, id);
          if (s.do === "tap") {
            setPressing((p) => p + 1);
            await sleep(140, id);
            el.click();
            await sleep(260, id);
          }
        }
      }
      if (run.current === id) {
        setCursorOn(false);
        setStatus("ended");
      }
    } catch (e) {
      if (!(e instanceof Aborted)) throw e;
    }
  }, [build, gate, moveTo, onView, prepare, sleep]);

  // «Пропустить» возвращает к свободному режиму без финальной карточки.
  const skip = useCallback(() => {
    run.current++;
    pausedFlag.current = false;
    paused.current?.resume();
    setCursorOn(false);
    setCaption("");
    setStatus("idle");
  }, []);

  const resume = useCallback(() => {
    pausedFlag.current = false;
    setStatus("playing");
    paused.current?.resume();
  }, []);

  // Касание пользователя (настоящее, isTrusted) ставит тур на паузу.
  useEffect(() => {
    if (status !== "playing") return;
    const onUser = (e: Event) => {
      if (!e.isTrusted) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-tour-hud]")) return;
      pausedFlag.current = true;
      setStatus("paused");
    };
    window.addEventListener("pointerdown", onUser, true);
    window.addEventListener("keydown", onUser, true);
    return () => {
      window.removeEventListener("pointerdown", onUser, true);
      window.removeEventListener("keydown", onUser, true);
    };
  }, [status]);

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => void play(), 700);
    return () => window.clearTimeout(id);
  }, [autoplay, play]);

  useEffect(() => () => void run.current++, []);

  const value = useMemo<TourContextValue>(
    () => ({ status, caption, step, total, start: () => void play(), skip, resume }),
    [status, caption, step, total, play, skip, resume],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {cursorOn && (status === "playing" || status === "paused") && (
          <motion.div
            className="pointer-events-none fixed top-0 left-0 z-[90]"
            style={{ x, y }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          >
            {touch ? (
              <motion.span
                key={pressing}
                className="absolute -top-6 -left-6 block size-12 rounded-full border-2 border-white/80 bg-white/25 shadow-[0_6px_20px_rgba(0,0,0,.35)]"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 0.72, 1] }}
                transition={{ duration: 0.36 }}
              />
            ) : (
              <motion.svg
                key={pressing}
                width="28"
                height="28"
                viewBox="0 0 28 28"
                className="-mt-1 -ml-1 drop-shadow-[0_4px_10px_rgba(0,0,0,.45)]"
                animate={{ scale: [1, 0.82, 1] }}
                transition={{ duration: 0.3 }}
              >
                <path d="M4 3 L22 13.5 L13.6 15.4 L9.6 23.5 Z" fill="#fff" stroke="#000" strokeWidth="1.4" strokeLinejoin="round" />
              </motion.svg>
            )}
            <motion.span
              key={`r${pressing}`}
              className="absolute -top-5 -left-5 block size-10 rounded-full border-2 border-white/70"
              initial={{ scale: 0.4, opacity: pressing ? 0.9 : 0 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.55 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

/** Панель тура: субтитр, прогресс, «Пропустить» и «Повторить». Вид задаёт бренд через className. */
export function TourHud({ className = "", captionClassName = "" }: { className?: string; captionClassName?: string }) {
  const tour = useTour();
  const t = useTranslations("tour");
  if (tour.status === "idle" || tour.status === "ended") return null;
  return (
    <div data-tour-hud className={`flex items-center gap-3 ${className}`} role="region" aria-label={t("progress", { step: tour.step, total: tour.total })}>
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.p
            key={tour.status === "paused" ? "paused" : tour.caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={`pretty ${captionClassName}`}
            aria-live="polite"
          >
            {tour.status === "paused" ? t("pausedHint") : tour.caption}
          </motion.p>
        </AnimatePresence>
        <div className="mt-2 h-[2px] bg-current/15" aria-hidden>
          <div className="h-full bg-current transition-[width] duration-500" style={{ width: `${(tour.step / Math.max(1, tour.total)) * 100}%` }} />
        </div>
      </div>
      {tour.status === "paused" ? (
        <button type="button" className="btn shrink-0" data-size="s" onClick={tour.resume}>
          <Play size={14} aria-hidden />
          {t("resume")}
        </button>
      ) : (
        <button type="button" className="btn shrink-0" data-variant="secondary" data-size="s" onClick={tour.skip}>
          <SkipForward size={14} aria-hidden />
          {t("skip")}
        </button>
      )}
    </div>
  );
}

export function TourButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const tour = useTour();
  const t = useTranslations("tour");
  const playing = tour.status === "playing" || tour.status === "paused";
  return (
    <button
      type="button"
      data-tour-hud
      className={`btn ${className}`}
      data-variant={compact ? "secondary" : undefined}
      data-size="s"
      onClick={playing ? tour.skip : tour.start}
      aria-label={playing ? t("skip") : t("play")}
    >
      {playing ? <Pause size={14} aria-hidden /> : tour.status === "ended" ? <RotateCcw size={14} aria-hidden /> : <Play size={14} aria-hidden />}
      {!compact && (playing ? t("skip") : tour.status === "ended" ? t("replay") : `${t("play")}`)}
    </button>
  );
}
