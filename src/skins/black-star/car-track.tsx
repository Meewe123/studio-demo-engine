"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Stage } from "@/modules/queue/carwash";

/** Силуэт абстрактного седана — без марок и узнаваемых моделей. */
export function CarSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" aria-hidden>
      <path
        d="M5 30.5V25c0-2.4 1.6-4 4-4.4l17.5-3L39.4 10c1.6-1.1 3.6-1.7 5.6-1.7h28.5c2.4 0 4.6.9 6.3 2.4l8.6 7.6 15 2.4c3.6.6 5.6 2.6 5.6 5.6v4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41 18.2 47 11.6h12.5v6.6H41Zm23 0v-6.6h9.5c1.4 0 2.6.5 3.6 1.4l5.4 5.2H64Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity=".7"
      />
      <path d="M17 30.5h16m21 0h29m21 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="30.5" r="5.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="93" cy="30.5" r="5.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="25" cy="30.5" r="1.6" fill="currentColor" />
      <circle cx="93" cy="30.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

const ORDER: Stage[] = ["waiting", "intake", "foam", "wash", "dry", "ready"];

/**
 * Машина проезжает «пена → мойка → сушка → готово». Положение — прогресс услуги,
 * эффект поверх силуэта — текущий этап.
 */
export function CarTrack({ stage, progress, labels }: { stage: Stage; progress: number; labels: Record<"foam" | "wash" | "dry" | "ready", string> }) {
  const reduced = useReducedMotion();
  const idx = ORDER.indexOf(stage);
  const x = stage === "waiting" ? 0 : stage === "ready" || stage === "done" ? 1 : progress;
  const stations = ["foam", "wash", "dry", "ready"] as const;

  return (
    <div className="relative">
      <div className="relative h-[92px] overflow-hidden">
        {/* полосы станций */}
        <div className="absolute inset-x-0 bottom-[14px] grid grid-cols-4">
          {stations.map((s, i) => (
            <div key={s} className={`h-[2px] ${idx >= i + 2 ? "bg-accent" : "bg-line"} ${i ? "ml-[3px]" : ""}`} />
          ))}
        </div>
        <motion.div
          className="absolute bottom-[16px] w-[38%] max-w-[150px] text-ink"
          initial={false}
          animate={{ left: `calc(${x * 100}% - ${x * 38}%)` }}
          transition={reduced ? { duration: 0 } : { type: "tween", ease: "linear", duration: 0.3 }}
        >
          <div className="relative">
            <CarSilhouette className={`w-full ${stage === "ready" ? "text-accent" : ""}`} />
            {stage === "foam" && !reduced && <Foam />}
            {stage === "wash" && !reduced && <Water />}
            {stage === "dry" && !reduced && <Air />}
            {stage === "ready" && <div className="pointer-events-none absolute -inset-x-4 -bottom-3 h-6 rounded-[50%] bg-accent/30 blur-md" />}
          </div>
        </motion.div>
      </div>
      <ol className="grid grid-cols-4 text-[0.75rem]">
        {stations.map((s, i) => (
          <li key={s} className={`pt-2 ${idx === i + 2 ? "text-accent" : idx > i + 2 ? "text-ink" : "text-muted"}`}>
            {labels[s]}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Foam() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {[12, 26, 40, 55, 68, 80].map((l, i) => (
        <motion.span
          key={l}
          className="absolute h-2.5 w-2.5 rounded-full bg-ink/80"
          style={{ left: `${l}%`, top: `${18 + (i % 3) * 14}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.85] }}
          transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.4 }}
        />
      ))}
    </div>
  );
}

function Water() {
  return (
    <div className="pointer-events-none absolute -top-6 inset-x-0 h-[150%] overflow-hidden">
      {[10, 24, 38, 52, 66, 80, 92].map((l, i) => (
        <motion.span
          key={l}
          className="absolute top-0 h-5 w-px bg-ink/70"
          style={{ left: `${l}%`, rotate: "14deg" }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 60, opacity: [0, 1, 0] }}
          transition={{ duration: 0.55, delay: i * 0.07, repeat: Infinity, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function Air() {
  return (
    <div className="pointer-events-none absolute inset-y-0 -right-2 w-1/3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute right-0 h-[2px] rounded bg-ink/60"
          style={{ top: `${20 + i * 22}%` }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: ["0%", "100%"], opacity: [0, 1, 0], x: [0, 14] }}
          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
