"use client";

import { useMemo } from "react";
import type { BlackStarCopy } from "@brands/black-star";
import { useBrand, useCopy } from "@/engine/brand-context";
import { useDemo } from "@/engine/store/demo-store";
import { fill, hhmm } from "@/lib/format";
import { etaOf, postsOf, stageOf, upcoming, type CarwashState } from "@/modules/queue/carwash";
import { Wordmark } from "@/skins/wordmark";
import { Qr } from "@/ui/qr";
import { Flap } from "./flap";

/** Только строки постов — для обложки на телефоне: табло живёт с первой секунды. */
export function PostRows({ className = "" }: { className?: string }) {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>();
  const model = useDemo<CarwashState, CarwashState>((s) => s.model);
  const now = useDemo<CarwashState, number>((s) => s.now);
  const branch = brand.branches[0];
  const posts = useMemo(() => postsOf(model, branch.id, branch.capacity), [model, branch]);
  const words: Record<string, string> = {
    intake: copy.app.stageIntake,
    foam: copy.app.stageFoam,
    wash: copy.app.stageWash,
    dry: copy.app.stageDry,
    ready: copy.board.ready,
  };
  return (
    <ul className={`flex flex-col gap-[0.3em] ${className}`}>
      {posts.map(({ post, car }) => {
        const stage = car ? stageOf(car, now) : null;
        return (
          <li key={post} className={`flex justify-between gap-[0.4em] ${stage === "ready" ? "[--flap-ink:var(--c-accent)]" : ""}`}>
            <Flap text={car?.plate ?? ""} length={11} steps={2} />
            <Flap text={stage ? (words[stage] ?? "") : ""} length={7} steps={2} />
            <Flap text={car?.status === "active" ? String(etaOf(car, now)) : ""} length={2} align="right" steps={1} />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Табло очереди. compact — мини-версия для страницы-презентации,
 * иначе — полноэкранное ТВ-табло, читаемое с 5 метров.
 */
export function BoardView({
  branchId,
  compact = false,
  appUrl,
  disclaimer,
}: {
  branchId?: string;
  compact?: boolean;
  appUrl?: string;
  disclaimer?: React.ReactNode;
}) {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>();
  const model = useDemo<CarwashState, CarwashState>((s) => s.model);
  const now = useDemo<CarwashState, number>((s) => s.now);
  const branch = brand.branches.find((b) => b.id === branchId) ?? brand.branches[0];

  const posts = useMemo(() => postsOf(model, branch.id, branch.capacity), [model, branch]);
  const next = useMemo(() => upcoming(model, branch.id, compact ? 2 : 4), [model, branch.id, compact]);

  const stageWord = (s: string) =>
    (
      ({ intake: copy.app.stageIntake, foam: copy.app.stageFoam, wash: copy.app.stageWash, dry: copy.app.stageDry, ready: copy.board.ready }) as Record<
        string,
        string
      >
    )[s] ?? "";

  const rows = posts.map(({ post, car }) => {
    if (!car) return { post, plate: "", stage: "", eta: "", ready: false, you: false };
    const stage = stageOf(car, now);
    return {
      post,
      plate: car.plate,
      stage: stageWord(stage),
      eta: car.status === "active" ? fill(copy.owner.minutes, { n: etaOf(car, now) }) : "",
      ready: stage === "ready",
      you: car.source === "you",
    };
  });

  return (
    <div className={`bs-board flex h-full flex-col bg-bg text-ink ${compact ? "bs-board-compact gap-4 p-4" : "gap-[2.2vw] p-[3vw]"}`}>
      <header className="flex items-center justify-between gap-6">
        <div className="flex items-baseline gap-[1.5vw]">
          {!compact && <Wordmark slug="black-star" className="text-[3.4vw]" />}
          <span className={`font-display uppercase tracking-[0.06em] text-muted ${compact ? "text-[0.6875rem]" : "text-[1.3vw]"}`}>{branch.name}</span>
        </div>
        <span className={compact ? "text-[1.1rem]" : "text-[3vw]"}>
          <Flap text={hhmm(now)} label={hhmm(now)} steps={1} />
        </span>
      </header>

      <table className="w-full border-separate border-spacing-x-[0.5em] border-spacing-y-[0.35em] -mx-[0.5em] w-[calc(100%+1em)]">
        <thead>
          <tr className={`text-left font-display whitespace-nowrap uppercase tracking-[0.08em] text-muted ${compact ? "text-[0.5625rem]" : "text-[1vw]"}`}>
            <th className="font-normal">{copy.board.plate}</th>
            <th className="font-normal">{copy.board.post}</th>
            <th className="font-normal">{copy.board.stage}</th>
            <th className="text-right font-normal">{copy.board.eta}</th>
          </tr>
        </thead>
        <tbody className={compact ? "text-[0.95rem]" : "text-[2.7vw]"}>
          {rows.map((r) => (
            <tr key={r.post} className={r.ready ? "bs-board-ready [--flap-ink:var(--c-accent)]" : r.you ? "[--flap-ink:var(--c-accent)]" : ""}>
              <td>
                <Flap text={r.plate} length={11} />
              </td>
              <td>
                <Flap text={String(r.post)} length={1} />
              </td>
              <td>
                <Flap text={r.stage} length={8} />
              </td>
              <td className="text-right">
                <Flap text={r.eta} length={6} align="right" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className={`mt-auto grid items-end gap-6 ${compact ? "" : "grid-cols-[1fr_auto]"}`}>
        <div>
          <h2 className={`font-display uppercase tracking-[0.08em] text-muted ${compact ? "text-[0.5625rem]" : "text-[1vw]"}`}>{copy.board.next}</h2>
          <ul className={`mt-[0.5em] flex flex-col gap-[0.35em] ${compact ? "text-[0.8rem]" : "text-[1.9vw]"}`}>
            {next.map((c) => (
              <li key={c.id} className={`flex gap-[0.6em] ${c.source === "you" ? "[--flap-ink:var(--c-accent)]" : ""}`}>
                <Flap text={hhmm(c.slot)} length={5} steps={1} />
                <Flap text={c.plate} length={11} steps={1} />
              </li>
            ))}
          </ul>
        </div>
        {!compact && appUrl && (
          <div className="flex items-center gap-[1.5vw]">
            <p className="max-w-[16vw] text-right font-display text-[1.3vw] leading-tight font-semibold">
              {copy.board.cta}
              <span className="mt-[0.4em] block text-[0.9vw] font-normal text-muted">{copy.board.scan}</span>
            </p>
            <div className="bg-[#EDEDE8] p-[0.6vw]">
              <Qr value={appUrl} className="size-[9vw]" fg="#0A0A0B" />
            </div>
          </div>
        )}
      </section>
      {!compact && disclaimer && <div className="[&_p]:text-[0.7vw]">{disclaimer}</div>}
    </div>
  );
}
