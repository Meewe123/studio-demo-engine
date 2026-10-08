"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИКЛМНОПРСТУФЦЧШЭЯ0123456789";
const FOLD_MS = 55;

interface CellState {
  shown: string;
  prev: string;
  flip: number;
}

/** Одна табличка: верхняя половина падает, открывая новый символ. */
const FlapCell = memo(function FlapCell({ ch, delay, steps }: { ch: string; delay: number; steps: number }) {
  const reduced = useReducedMotion();
  const [cell, setCell] = useState<CellState>({ shown: ch, prev: ch, flip: 0 });
  const current = useRef(ch);

  useEffect(() => {
    if (ch === current.current) return;
    current.current = ch;
    const timers: number[] = [];
    if (reduced) {
      timers.push(window.setTimeout(() => setCell((c) => ({ shown: ch, prev: ch, flip: c.flip })), 0));
      return () => timers.forEach(clearTimeout);
    }
    const seq: string[] = [];
    for (let i = 0; i < steps; i++) seq.push(CHARSET[(ch.charCodeAt(0) * 7 + i * 13 + delay) % CHARSET.length]);
    seq.push(ch);
    seq.forEach((next, i) => {
      timers.push(window.setTimeout(() => setCell((c) => ({ prev: c.shown, shown: next, flip: c.flip + 1 })), delay + i * FOLD_MS * 2));
    });
    return () => timers.forEach(clearTimeout);
  }, [ch, delay, steps, reduced]);

  const shown = cell.shown === " " ? " " : cell.shown;
  const prev = cell.prev === " " ? " " : cell.prev;
  return (
    <span className="flap" aria-hidden>
      <span className="flap-half flap-top">
        <span>{shown}</span>
      </span>
      <span className="flap-half flap-bottom">
        <span>{cell.flip ? prev : shown}</span>
      </span>
      {cell.flip > 0 && (
        <>
          <span key={`t${cell.flip}`} className="flap-half flap-top flap-fold-top">
            <span>{prev}</span>
          </span>
          <span key={`b${cell.flip}`} className="flap-half flap-bottom flap-fold-bottom" onAnimationEnd={() => setCell((c) => ({ ...c, prev: c.shown }))}>
            <span>{shown}</span>
          </span>
        </>
      )}
    </span>
  );
});

/**
 * Строка перекидного табло. Текст читается скринридером целиком, таблички — декорация.
 * length — фиксированная ширина в символах, чтобы колонки табло не прыгали.
 */
export function Flap({
  text,
  length,
  className = "",
  stagger = 28,
  steps = 3,
  label,
  align = "left",
}: {
  text: string;
  length?: number;
  className?: string;
  stagger?: number;
  steps?: number;
  label?: string;
  align?: "left" | "right";
}) {
  const value = text.toUpperCase();
  const padded = length ? (align === "right" ? value.padStart(length, " ") : value.padEnd(length, " ")).slice(0, length) : value;
  return (
    <span className={`flap-row ${className}`}>
      <span className="sr-only">{label ?? text}</span>
      {[...padded].map((ch, i) => (
        <FlapCell key={i} ch={ch} delay={i * stagger} steps={steps} />
      ))}
    </span>
  );
}
