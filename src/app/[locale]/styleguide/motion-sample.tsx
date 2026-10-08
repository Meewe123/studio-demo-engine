"use client";

import { Play } from "lucide-react";
import { useState } from "react";

/** Показывает кривую и длительность движения бренда на одном и том же действии. */
export function MotionSample({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <button type="button" className="btn" data-variant="secondary" data-size="s" onClick={() => setOn((v) => !v)} aria-pressed={on}>
        <Play size={14} aria-hidden />
        {label}
      </button>
      <div className="relative h-11 flex-1 overflow-hidden rounded-s bg-surface" aria-hidden>
        <div
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-s bg-accent"
          style={{
            left: on ? "calc(100% - 1.75rem)" : "0.25rem",
            transition: "left var(--dur-slow) var(--ease)",
          }}
        />
      </div>
    </div>
  );
}
