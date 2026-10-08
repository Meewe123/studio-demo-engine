"use client";

import { Car as CarIcon, MonitorPlay, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { BlackStarCopy } from "@brands/black-star";
import { useBrand, useCopy } from "@/engine/brand-context";
import { useDemo, useDemoApi } from "@/engine/store/demo-store";
import { haptic } from "@/engine/telegram/webapp";
import { fill, hhmm } from "@/lib/format";
import { callNext, etaOf, kpisOf, postsOf, progressOf, stageOf, walkIn, type Car, type CarwashState, type FeedItem } from "@/modules/queue/carwash";
import { Wordmark } from "@/skins/wordmark";
import { Plate } from "./plate";

type OwnerCopy = BlackStarCopy["owner"];
type AppCopy = BlackStarCopy["app"];

const STAGE_KEYS = ["intake", "foam", "wash", "dry"] as const;

/**
 * Пульт администратора. Один компонент на все размеры: от колонки рядом с телефоном
 * до полноэкранного /admin — раскладка через container queries.
 */
export function BlackStarOwner({
  branchId: controlled,
  onBranch,
  boardHref,
  embedded = false,
}: {
  branchId?: string;
  onBranch?: (id: string) => void;
  boardHref?: string;
  /** На странице-презентации: без вордмарка, его уже видно в шапке. */
  embedded?: boolean;
}) {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>();
  const o = copy.owner;
  const api = useDemoApi<CarwashState>();
  const model = useDemo<CarwashState, CarwashState>((s) => s.model);
  const now = useDemo<CarwashState, number>((s) => s.now);
  const [own, setOwn] = useState(brand.branches[0].id);
  const branchId = controlled ?? own;
  const branch = brand.branches.find((b) => b.id === branchId) ?? brand.branches[0];

  const posts = useMemo(() => postsOf(model, branch.id, branch.capacity), [model, branch]);
  const kpi = useMemo(() => kpisOf(model, branch), [model, branch]);
  const feed = useMemo(() => model.feed.filter((f) => f.branch === branch.id).slice(0, 7), [model.feed, branch.id]);

  const setBranch = (id: string) => {
    haptic("select");
    if (onBranch) onBranch(id);
    else setOwn(id);
  };

  return (
    <div className="@container relative flex h-full min-h-0 flex-col bg-bg text-ink">
      <header
        className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-4 pb-3 @3xl:px-6"
        style={{ paddingTop: "calc(12px + var(--app-top, 0px))" }}
      >
        <div className="flex items-baseline gap-3">
          {!embedded && <Wordmark slug="black-star" className="text-[1rem]" />}
          <h1 className={embedded ? "font-display text-[0.9375rem] font-semibold" : "text-[0.875rem] text-muted"}>{o.title}</h1>
        </div>
        <span className="type-mono text-sm text-muted @3xl:order-last">{hhmm(now)}</span>
        <div className="flex w-full flex-wrap items-center gap-3 @3xl:ml-auto @3xl:w-auto">
          <div className="seg flex-1 @3xl:flex-none" role="group" aria-label={copy.app.branch}>
            {brand.branches.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={b.id === branch.id}
                onClick={() => setBranch(b.id)}
                className="relative !min-h-9 !px-3 !text-[0.8125rem]"
              >
                {b.id === branch.id && (
                  <motion.span layoutId="bs-owner-branch" className="seg-thumb" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                )}
                <span className="relative">{b.name}</span>
              </button>
            ))}
          </div>
          {boardHref && (
            <a href={boardHref} target="_blank" rel="noreferrer" className="btn hidden @3xl:inline-flex" data-variant="secondary" data-size="s">
              <MonitorPlay size={16} aria-hidden />
              {o.openBoard}
            </a>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-8 @3xl:px-6">
        <dl className="grid grid-cols-2 gap-px bg-line @3xl:grid-cols-4">
          {[
            [o.kpiCars, String(kpi.cars)],
            [o.kpiWait, fill(o.minutes, { n: kpi.wait })],
            [o.kpiLoad, `${kpi.load}%`],
            [o.kpiOnline, `${kpi.online}%`],
          ].map(([label, value]) => (
            <div key={label} className="bg-bg px-3 py-3 @3xl:px-4">
              <dt className="text-[0.75rem] text-muted">{label}</dt>
              <dd className="type-mono mt-1 text-[1.75rem] leading-none font-semibold @3xl:text-[2.25rem]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <h2 className="text-[0.8125rem] text-muted">{o.posts}</h2>
            <ul className="mt-3 grid gap-2 @xl:grid-cols-2">
              {posts.map(({ post, car, next }) => (
                <li key={post}>
                  <PostCard
                    post={post}
                    car={car}
                    next={next}
                    now={now}
                    o={o}
                    app={copy.app}
                    serviceName={(id) => brand.services.find((s) => s.id === id)?.name ?? ""}
                    onCall={() => {
                      haptic("medium");
                      api.getState().act((m, ctx) => {
                        callNext(m, branch.id, post, ctx.now);
                      });
                    }}
                  />
                </li>
              ))}
            </ul>

            <h2 className="mt-8 text-[0.8125rem] text-muted">{o.schedule}</h2>
            <Schedule model={model} branchId={branch.id} capacity={branch.capacity} now={now} label={o.schedule} />
          </div>

          <aside className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.8125rem] text-muted">{o.feed}</h2>
              <button
                type="button"
                className="btn"
                data-variant="secondary"
                data-size="s"
                data-tour="walk-in"
                onClick={() => {
                  haptic("light");
                  api.getState().act((m, ctx) => {
                    walkIn(m, ctx.brand, ctx.rng, branch.id, ctx.now);
                  });
                }}
              >
                <Plus size={16} aria-hidden />
                {o.walkIn}
              </button>
            </div>
            <ol className="mt-3 flex flex-col" aria-live="polite">
              <AnimatePresence initial={false}>
                {feed.map((f) => (
                  <motion.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.7, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <FeedRow item={f} o={o} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
            <p className="pretty mt-4 border-t border-line pt-4 text-[0.75rem] text-muted">{o.fairness}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  car,
  next,
  now,
  o,
  app,
  serviceName,
  onCall,
}: {
  post: number;
  car?: Car;
  next?: Car;
  now: number;
  o: OwnerCopy;
  app: AppCopy;
  serviceName: (id: string) => string;
  onCall: () => void;
}) {
  const stage = car ? stageOf(car, now) : null;
  const progress = car ? progressOf(car, now) : 0;
  const free = !car || car.status === "ready";
  const stageText: Record<string, string> = { intake: app.stageIntake, foam: app.stageFoam, wash: app.stageWash, dry: app.stageDry, ready: app.stageReady };

  return (
    <article
      className={`bs-panel flex h-full flex-col gap-2.5 p-3.5 @xl:gap-3 @xl:p-4 ${car?.source === "you" ? "shadow-[inset_0_0_0_1px_var(--c-accent)]" : ""}`}
      data-tour={car?.source === "you" ? "owner-yours" : undefined}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-[0.875rem] font-semibold">{fill(o.post, { n: post })}</h3>
        <span className={`text-[0.75rem] ${stage === "ready" ? "text-accent" : "text-muted"}`}>{stage ? stageText[stage] : o.free}</span>
      </div>
      {car ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <Plate plate={car.plate} size="s" />
            <span className="type-mono text-[1.5rem] leading-none font-semibold">
              {car.status === "active" ? fill(o.minutes, { n: etaOf(car, now) }) : "—"}
            </span>
          </div>
          <p className="truncate text-[0.75rem] text-muted">{serviceName(car.service)}</p>
          <div className="grid grid-cols-4 gap-[3px]" aria-hidden>
            {STAGE_KEYS.map((k, i) => {
              const from = [0, 0.08, 0.3, 0.72][i];
              const to = [0.08, 0.3, 0.72, 1][i];
              const fillPct = Math.min(1, Math.max(0, (progress - from) / (to - from)));
              return (
                <span key={k} className="h-[3px] bg-line">
                  <span className="block h-full bg-accent transition-[width] duration-300 ease-linear" style={{ width: `${fillPct * 100}%` }} />
                </span>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 py-3 text-muted">
          <CarIcon size={18} aria-hidden />
          <span className="text-[0.8125rem]">{next ? fill(o.nextBooked, { time: hhmm(next.slot) }) : o.free}</span>
        </div>
      )}
      <div className="mt-auto flex min-h-11 items-center justify-between gap-3">
        <span className="truncate text-[0.75rem] text-muted">{car && next ? fill(o.nextBooked, { time: hhmm(next.slot) }) : ""}</span>
        {free && (next || car) && (
          <button type="button" className="btn shrink-0" data-size="s" onClick={onCall}>
            {o.callNext}
          </button>
        )}
      </div>
    </article>
  );
}

function FeedRow({ item, o }: { item: FeedItem; o: OwnerCopy }) {
  const plate = item.plate.replace(/ /g, "\u00A0");
  const text =
    item.kind === "booked"
      ? fill(o.feedBooked, { plate, time: hhmm(item.time ?? 0) })
      : item.kind === "ready"
        ? fill(o.feedReady, { plate })
        : item.kind === "started"
          ? fill(o.feedStarted, { plate, post: item.post ?? "" })
          : fill(o.walkInDone, { plate, time: hhmm(item.time ?? 0) });
  return (
    <div
      className={`grid grid-cols-[3.25rem_1fr] gap-2 border-b border-line py-2.5 text-[0.8125rem] ${item.you ? "text-accent" : ""}`}
      data-tour={item.you && item.kind === "booked" ? "feed-yours" : undefined}
    >
      <span className="type-mono text-muted">{hhmm(item.at)}</span>
      <span className="pretty">{text}</span>
    </div>
  );
}

function Schedule({ model, branchId, capacity, now, label }: { model: CarwashState; branchId: string; capacity: number; now: number; label: string }) {
  const start = Math.floor((now - 30) / 60) * 60;
  const span = 5 * 60;
  const hours = Array.from({ length: 6 }, (_, i) => start + i * 60);
  const pct = (m: number) => ((m - start) / span) * 100;
  const cars = model.cars.filter((c) => c.branch === branchId && c.status !== "done");

  return (
    <div className="relative mt-3 select-none" role="img" aria-label={label}>
      <div className="relative ml-6 h-5 text-[0.6875rem] text-muted">
        {hours.map((h) => (
          <span key={h} className="type-mono absolute -translate-x-1/2" style={{ left: `${pct(h)}%` }}>
            {hhmm(h)}
          </span>
        ))}
      </div>
      <div className="relative ml-6 flex flex-col gap-1.5 overflow-hidden">
        {hours.map((h) => (
          <span key={h} className="absolute inset-y-0 w-px bg-line/70" style={{ left: `${pct(h)}%` }} aria-hidden />
        ))}
        {Array.from({ length: capacity }, (_, i) => i + 1).map((post) => (
          <div key={post} className="relative h-8">
            <span className="type-mono absolute top-1/2 -left-6 -translate-y-1/2 text-[0.75rem] text-muted">{post}</span>
            <AnimatePresence initial={false}>
              {cars
                .filter((c) => c.post === post)
                .map((c) => {
                  const s = c.start ?? c.slot;
                  const left = pct(s);
                  const width = (c.dur / span) * 100;
                  if (left > 100 || left + width < 0) return null;
                  const active = c.status === "active" || c.status === "ready";
                  return (
                    <motion.span
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: -14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 26 }}
                      className={`absolute top-0 h-full overflow-hidden ${
                        c.source === "you"
                          ? "bg-accent/20 shadow-[inset_0_0_0_1.5px_var(--c-accent)]"
                          : active
                            ? "bg-raised shadow-[inset_0_0_0_1px_var(--c-line)]"
                            : c.source === "walkin"
                              ? "shadow-[inset_0_0_0_1px_var(--c-line)] [background:repeating-linear-gradient(135deg,transparent_0_5px,rgba(255,255,255,.04)_5px_10px)]"
                              : "bg-surface shadow-[inset_0_0_0_1px_var(--c-line)]"
                      }`}
                      style={{ left: `${Math.max(0, left)}%`, width: `calc(${width}% - 2px)` }}
                      data-tour={c.source === "you" ? "grid-yours" : undefined}
                    >
                      {active && <span className="absolute inset-y-0 left-0 bg-accent/80" style={{ width: `${progressOf(c, now) * 100}%` }} />}
                      <span className="type-mono relative block truncate px-1.5 text-[0.625rem] leading-8 text-ink/80">{c.plate}</span>
                    </motion.span>
                  );
                })}
            </AnimatePresence>
          </div>
        ))}
        <span
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-accent shadow-[0_0_12px_var(--c-accent)]"
          style={{ left: `${pct(now)}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
