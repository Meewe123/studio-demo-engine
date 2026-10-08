"use client";

import { ChevronLeft, Coffee, Send, MessageSquareText } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BlackStarCopy } from "@brands/black-star";
import { useBrand, useCopy } from "@/engine/brand-context";
import { useDemo, useDemoApi } from "@/engine/store/demo-store";
import { NORMAL_SPEED } from "@/engine/sim/clock";
import { hash } from "@/engine/sim/rng";
import { PrimaryAction, useBackButton } from "@/engine/telegram/use-telegram";
import { haptic } from "@/engine/telegram/webapp";
import type { Locale } from "@/i18n/config";
import { fill, formatAmount, hhmm } from "@/lib/format";
import {
  bookYours,
  cancelYours,
  etaOf,
  pickUpYours,
  postsOf,
  progressOf,
  slotsFor,
  stageOf,
  type Car,
  type CarwashState,
  type Stage,
} from "@/modules/queue/carwash";
import { Wordmark } from "@/skins/wordmark";
import { TgNotice } from "@/ui/tg-notice";
import { CarTrack } from "./car-track";
import { Flap } from "./flap";
import { Plate, splitPlate } from "./plate";
import { ParkingTicket } from "./ticket";
import { useClientUi, type Screen } from "./ui-store";

type Copy = BlackStarCopy["app"];

function useDuration() {
  const t = useTranslations("common");
  return (min: number) => {
    const m = Math.max(0, Math.round(min));
    if (m < 60) return t("min", { n: m });
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest ? `${t("hours", { n: h })} ${t("min", { n: rest })}` : t("hours", { n: h });
  };
}

function stageLabel(copy: Copy, stage: Stage, slotTime: string) {
  switch (stage) {
    case "waiting":
      return fill(copy.stageWaiting, { time: slotTime });
    case "intake":
      return copy.stageIntake;
    case "foam":
      return copy.stageFoam;
    case "wash":
      return copy.stageWash;
    case "dry":
      return copy.stageDry;
    default:
      return copy.stageReady;
  }
}

const ORDER: Screen[] = ["home", "service", "time", "car", "ticket"];

/**
 * Клиентское приложение Black Star. Работает полноэкранно (/app, Mini App)
 * и внутри рамки телефона на странице-презентации.
 */
export function BlackStarClient() {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>().app;
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const api = useDemoApi<CarwashState>();
  const model = useDemo<CarwashState, CarwashState>((s) => s.model);
  const now = useDemo<CarwashState, number>((s) => s.now);
  const live = useDemo<CarwashState, boolean>((s) => s.live);
  const ui = useClientUi();
  const reduced = useReducedMotion();
  const duration = useDuration();

  const branchId = ui.branch || brand.branches[0].id;
  const branch = brand.branches.find((b) => b.id === branchId) ?? brand.branches[0];
  const yours = model.cars.find((c) => c.id === model.you);
  const screen: Screen = ui.screen === "ticket" && !yours ? "home" : ui.screen;

  // Если талон уже есть (после перезагрузки), открываем его.
  const restored = useRef(false);
  useEffect(() => {
    if (!live || restored.current) return;
    restored.current = true;
    if (yours && ui.screen === "home") ui.go("ticket");
  }, [live, yours, ui]);

  // Когда машина готова — уведомление и вибрация.
  const [notice, setNotice] = useState(false);
  const seenNotice = useRef<string | undefined>(undefined);
  useEffect(() => {
    const key = model.readyNotice ? `${model.readyNotice.carId}:${model.readyNotice.at}` : undefined;
    if (!key || key === seenNotice.current) return;
    seenNotice.current = key;
    const show = window.setTimeout(() => setNotice(true), 0);
    haptic("success");
    const hide = window.setTimeout(() => setNotice(false), 6000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [model.readyNotice]);

  // Перемотка заканчивается, когда машина готова.
  useEffect(() => {
    if (yours?.status === "ready" && api.getState().clock.speed > NORMAL_SPEED) api.getState().setSpeed(NORMAL_SPEED);
  }, [yours?.status, api]);

  const back = screen === "home" || screen === "ticket" ? null : () => ui.go(ORDER[ORDER.indexOf(screen) - 1]);
  const { native } = useBackButton(back);

  const service = brand.services.find((s) => s.id === ui.service) ?? brand.services[0];

  const nearest = useMemo(() => {
    const slots = slotsFor(model, branch, brand.services[0].duration, now, 0);
    return slots.find((s) => s.free);
  }, [model, branch, brand.services, now]);

  const nearestPost = useMemo(() => {
    if (!nearest) return null;
    const posts = postsOf(model, branch.id, branch.capacity);
    return posts.find((p) => !p.next || p.next.slot >= nearest.t + brand.services[0].duration)?.post ?? 1;
  }, [model, branch, nearest, brand.services]);

  function book() {
    if (ui.slot === null) return;
    api.getState().act((m, ctx) => {
      bookYours(m, ctx.brand, { branch: branch.id, service: service.id, slot: ui.slot!, plate: ui.plate.trim() || "01 A 123 BC" }, ctx.now);
    });
    haptic("success");
    ui.go("ticket");
  }

  function fastForward() {
    const s = api.getState();
    const car = s.model.cars.find((c) => c.id === s.model.you);
    if (!car) return;
    if (car.status === "booked" && car.slot > s.now) s.jumpTo(car.slot - 0.25);
    s.setSpeed(Math.max(1.5, car.dur / 7));
    haptic("light");
  }

  const slotTime = (car: Car) => {
    const day = Math.floor(car.slot / 1440) - model.day;
    return day > 0 ? fill(copy.tomorrowAt, { time: hhmm(car.slot) }) : hhmm(car.slot);
  };

  const screenTransition = reduced ? { duration: 0 } : { duration: 0.22, ease: [0.7, 0, 0.2, 1] as const };

  return (
    <div className="@container relative flex h-full min-h-0 flex-col bg-bg text-ink texture-wet-asphalt">
      <TgNotice
        open={notice}
        title={`${brand.name}`}
        body={yours ? fill(copy.notifyBody, { plate: yours.plate, post: yours.post }) : ""}
        onClose={() => setNotice(false)}
      />

      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3" style={{ paddingTop: "calc(12px + var(--app-top, 0px))" }}>
        {back && !native ? (
          <button type="button" onClick={back} className="-ml-2 flex min-h-11 items-center gap-1 px-2 text-sm text-muted" data-tour="back">
            <ChevronLeft size={20} aria-hidden />
            {copy.back}
          </button>
        ) : (
          <Wordmark slug="black-star" className="text-[1.0625rem]" />
        )}
        <span className="type-mono flex items-center gap-2 text-sm text-muted" aria-label={hhmm(now)}>
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-accent" />
          </span>
          {hhmm(now)}
        </span>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={screenTransition}
            className="px-4 pb-6"
          >
            {screen === "home" && (
              <Home
                copy={copy}
                branchId={branch.id}
                onBranch={(id) => {
                  haptic("select");
                  ui.set({ branch: id, slot: null });
                }}
                nearest={nearest ? { time: hhmm(nearest.t), post: nearestPost ?? 1, inMin: duration(nearest.t - now) } : null}
                model={model}
                now={now}
              />
            )}
            {screen === "service" && (
              <section aria-labelledby="bs-service">
                <StepHead n={1} copy={copy} id="bs-service" title={copy.serviceTitle} />
                <ul className="mt-5 flex flex-col gap-2">
                  {brand.services.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        data-tour={`service-${s.id}`}
                        onClick={() => {
                          haptic("select");
                          ui.set({ service: s.id, slot: null });
                          ui.go("time");
                        }}
                        className="bs-row group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 text-left"
                        aria-pressed={ui.service === s.id}
                      >
                        <span className="font-display text-[1rem] font-medium">{s.name}</span>
                        <span className="type-mono text-right text-[1rem]">{t("sum", { amount: formatAmount(s.price, locale) })}</span>
                        <span className="text-[0.8125rem] text-muted">{s.note}</span>
                        <span className="type-mono text-right text-[0.8125rem] text-muted">{duration(s.duration)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {screen === "time" && <TimeStep copy={copy} model={model} now={now} branch={branch} serviceDuration={service.duration} />}
            {screen === "car" && (
              <section aria-labelledby="bs-car">
                <StepHead n={3} copy={copy} id="bs-car" title={copy.carTitle} />
                <PlateInput value={ui.plate} onChange={(plate) => ui.set({ plate })} label={copy.carTitle} />
                <p className="mt-2 text-[0.8125rem] text-muted">{copy.plateHint}</p>
                <h3 className="mt-7 text-[0.8125rem] text-muted">{copy.notifyTitle}</h3>
                <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label={copy.notifyTitle}>
                  {(["telegram", "sms"] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={ui.notify === n}
                      className="chip"
                      onClick={() => {
                        haptic("select");
                        ui.set({ notify: n });
                      }}
                    >
                      {n === "telegram" ? <Send size={16} aria-hidden /> : <MessageSquareText size={16} aria-hidden />}
                      {n === "telegram" ? copy.notifyTelegram : copy.notifySms}
                    </button>
                  ))}
                </div>
                <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-line pt-4 text-[0.875rem]">
                  <dt className="text-muted">{copy.ticketService}</dt>
                  <dd className="text-right">{service.name}</dd>
                  <dt className="text-muted">{copy.ticketTime}</dt>
                  <dd className="type-mono text-right">{ui.slot !== null ? (ui.day ? fill(copy.tomorrowAt, { time: hhmm(ui.slot) }) : hhmm(ui.slot)) : "—"}</dd>
                  <dt className="text-muted">{copy.ticketBranch}</dt>
                  <dd className="text-right">{branch.name}</dd>
                </dl>
              </section>
            )}
            {screen === "ticket" && yours && (
              <TicketScreen
                copy={copy}
                car={yours}
                now={now}
                branchName={branch.name}
                serviceName={brand.services.find((s) => s.id === yours.service)?.name ?? ""}
                slotLabel={slotTime(yours)}
                untilLabel={duration(yours.slot - now)}
                onFastForward={fastForward}
                onCancel={() => {
                  api.getState().act((m) => cancelYours(m));
                  ui.go("home");
                }}
                onReschedule={() => {
                  api.getState().act((m) => cancelYours(m));
                  ui.set({ slot: null });
                  ui.go("time");
                }}
                onAgain={() => {
                  api.getState().act((m) => pickUpYours(m));
                  ui.reset(branch.id);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {(screen === "home" || screen === "car") && (
        <div className="shrink-0 px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          {screen === "home" ? (
            <PrimaryAction
              label={copy.pickTime}
              tour="pick-time"
              color={brand.theme.color.accent}
              textColor={brand.theme.color.onAccent}
              onClick={() => ui.go("service")}
            />
          ) : (
            <PrimaryAction
              label={fill(copy.confirm, { time: ui.slot !== null ? hhmm(ui.slot) : "" })}
              tour="confirm"
              disabled={ui.slot === null}
              color={brand.theme.color.accent}
              textColor={brand.theme.color.onAccent}
              onClick={book}
            />
          )}
        </div>
      )}
    </div>
  );
}

function StepHead({ n, copy, id, title }: { n: number; copy: Copy; id: string; title: string }) {
  return (
    <div className="pt-2">
      <p className="type-mono text-[0.8125rem] text-muted">{fill(copy.step, { n })}</p>
      <div className="mt-2 grid grid-cols-3 gap-1" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-[3px] ${i <= n ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <h2 id={id} className="type-display mt-5 text-[1.75rem]">
        {title}
      </h2>
    </div>
  );
}

function Home({
  copy,
  branchId,
  onBranch,
  nearest,
  model,
  now,
}: {
  copy: Copy;
  branchId: string;
  onBranch: (id: string) => void;
  nearest: { time: string; post: number; inMin: string } | null;
  model: CarwashState;
  now: number;
}) {
  const brand = useBrand();
  const branch = brand.branches.find((b) => b.id === branchId) ?? brand.branches[0];
  const posts = postsOf(model, branch.id, branch.capacity);

  return (
    <div className="flex flex-col">
      <div className="seg w-full" role="group" aria-label={copy.branch}>
        {brand.branches.map((b) => (
          <button key={b.id} type="button" aria-pressed={b.id === branch.id} onClick={() => onBranch(b.id)} className="relative">
            {b.id === branch.id && <motion.span layoutId="bs-branch" className="seg-thumb" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative">{b.name}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[0.75rem] text-muted">
        {branch.address}, {branch.hours}
      </p>

      <h1 className="bs-home-title type-display bs-chrome mt-7 text-[clamp(1.875rem,10cqw,2.75rem)]">{copy.headline}</h1>

      <section className="bs-panel mt-7 p-5" aria-label={copy.nearest}>
        <p className="text-[0.8125rem] text-muted">{copy.nearest}</p>
        {nearest ? (
          <>
            <div className="mt-3 text-[clamp(2.5rem,14cqw,3.25rem)] [--flap-bg:#1d1e22] [--flap-ink:var(--c-accent)]">
              <Flap text={nearest.time} label={nearest.time} />
            </div>
            <p className="mt-3 text-[0.8125rem] text-muted">{fill(copy.nearestNote, { post: nearest.post, min: nearest.inMin })}</p>
          </>
        ) : (
          <p className="mt-2 text-[0.875rem]">{copy.noSlots}</p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="bs-posts">
        <h2 id="bs-posts" className="text-[0.8125rem] text-muted">
          {copy.nowOnPosts}
        </h2>
        <ul className="mt-3 flex flex-col">
          {posts.map(({ post, car }) => (
            <li key={post} className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 border-b border-line py-3 last:border-0">
              <span className="type-mono text-xl text-muted">{post}</span>
              {car ? (
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex items-center gap-2">
                    <Plate plate={car.plate} size="s" />
                    <span className={`truncate text-[0.75rem] ${car.status === "ready" ? "text-accent" : "text-muted"}`}>
                      {stageLabel(copy, stageOf(car, now), "")}
                    </span>
                  </span>
                  <span className="h-[2px] bg-line">
                    <span className="block h-full bg-accent transition-[width] duration-300 ease-linear" style={{ width: `${progressOf(car, now) * 100}%` }} />
                  </span>
                </span>
              ) : (
                <span className="text-[0.8125rem] text-muted">{copy.postFree}</span>
              )}
              <span className="type-mono text-[0.875rem]">{car && car.status === "active" ? fill(copy.minutesLeft, { n: etaOf(car, now) }) : ""}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 flex gap-3 border-t border-line pt-5">
        <Coffee size={20} className="mt-0.5 text-accent" aria-hidden />
        <div>
          <h2 className="font-display text-[0.9375rem] font-medium">{copy.cafeTitle}</h2>
          <p className="pretty mt-1 text-[0.8125rem] text-muted">{copy.cafeText}</p>
        </div>
      </section>
    </div>
  );
}

function TimeStep({
  copy,
  model,
  now,
  branch,
  serviceDuration,
}: {
  copy: Copy;
  model: CarwashState;
  now: number;
  branch: { id: string; capacity: number; name: string };
  serviceDuration: number;
}) {
  const ui = useClientUi();
  const slots = useMemo(() => slotsFor(model, branch, serviceDuration, now, ui.day), [model, branch, serviceDuration, now, ui.day]);
  const firstFree = slots.find((s) => s.free)?.t;

  return (
    <section aria-labelledby="bs-time">
      <StepHead n={2} copy={copy} id="bs-time" title={copy.timeTitle} />
      <div className="seg mt-5 w-full" role="group" aria-label={copy.timeTitle}>
        {([0, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={ui.day === d}
            onClick={() => {
              haptic("select");
              ui.set({ day: d, slot: null });
            }}
            className="relative"
          >
            {ui.day === d && <motion.span layoutId="bs-day" className="seg-thumb" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative">{d ? copy.tomorrow : copy.today}</span>
          </button>
        ))}
      </div>
      {slots.some((s) => s.free) ? (
        <ul className="mt-5 grid grid-cols-4 gap-2" aria-label={copy.timeTitle}>
          {slots.map((s) => (
            <li key={s.t}>
              <button
                type="button"
                className="chip w-full"
                disabled={!s.free}
                aria-pressed={ui.slot === s.t}
                aria-label={s.free ? hhmm(s.t) : `${hhmm(s.t)}, ${copy.slotTaken}`}
                data-tour={s.t === firstFree ? "slot-first" : undefined}
                onClick={() => {
                  haptic("select");
                  ui.set({ slot: s.t });
                  ui.go("car");
                }}
              >
                {hhmm(s.t)}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-[0.875rem] text-muted">{copy.noSlots}</p>
      )}
      <p className="mt-4 text-[0.8125rem] text-muted">{copy.holdNote}</p>
    </section>
  );
}

function PlateInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const { region, rest } = splitPlate(value);
  return (
    <div className="mt-5 flex items-stretch overflow-hidden rounded-[4px] bg-[#EDEDE8] font-mono font-semibold text-[#0A0A0B] shadow-[inset_0_0_0_2px_#0A0A0B] focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent">
      <input
        aria-label={`${label}: регион`}
        inputMode="numeric"
        maxLength={2}
        value={region}
        onChange={(e) => onChange(`${e.target.value.replace(/\D/g, "").slice(0, 2)} ${rest}`)}
        className="w-[3.2ch] bg-transparent py-3 pl-3 text-center text-[1.625rem] tnum outline-none shadow-[2px_0_0_#0A0A0B]"
      />
      <input
        aria-label={label}
        autoCapitalize="characters"
        value={rest}
        onChange={(e) => onChange(`${region} ${e.target.value.toUpperCase().slice(0, 10)}`)}
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[1.625rem] uppercase tnum outline-none"
      />
      <span className="flex items-center pr-3 text-[0.875rem] tracking-[0.04em]">UZ</span>
    </div>
  );
}

function TicketScreen({
  copy,
  car,
  now,
  branchName,
  serviceName,
  slotLabel,
  untilLabel,
  onFastForward,
  onCancel,
  onReschedule,
  onAgain,
}: {
  copy: Copy;
  car: Car;
  now: number;
  branchName: string;
  serviceName: string;
  slotLabel: string;
  untilLabel: string;
  onFastForward: () => void;
  onCancel: () => void;
  onReschedule: () => void;
  onAgain: () => void;
}) {
  const stage = stageOf(car, now);
  const no = String((hash(car.id) % 9000) + 1000);
  const isReady = car.status === "ready";

  return (
    <div className="flex flex-col pt-1">
      <ParkingTicket
        data={{ no, time: slotLabel, post: car.post, service: serviceName, plate: car.plate, branch: branchName, qr: `BS-${no}-${car.plate}` }}
        labels={{
          title: copy.ticketTitle,
          no: fill(copy.ticketNo, { n: no }),
          time: copy.ticketTime,
          post: copy.ticketPost,
          service: copy.ticketService,
          plate: copy.ticketPlate,
          qr: copy.ticketQr,
        }}
      />

      <section className="mt-2" aria-live="polite">
        {isReady ? (
          <div className="bs-panel relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-accent/25 blur-2xl" aria-hidden />
            <p className="type-display relative text-[1.625rem] text-accent">{copy.readyTitle}</p>
            <p className="relative mt-2 text-[0.875rem] text-muted">{fill(copy.readyText, { post: car.post })}</p>
          </div>
        ) : (
          <p className="text-[0.9375rem]">
            {car.status === "booked"
              ? fill(copy.ticketIn, { time: untilLabel })
              : fill(copy.onPost, { post: car.post, min: fill(copy.minutesLeft, { n: etaOf(car, now) }) })}
          </p>
        )}
        <div className="mt-4">
          <CarTrack
            stage={stage}
            progress={progressOf(car, now)}
            labels={{ foam: copy.stageFoam, wash: copy.stageWash, dry: copy.stageDry, ready: copy.stageReady }}
          />
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-2">
        {isReady ? (
          <button type="button" className="btn" data-block onClick={onAgain} data-tour="again">
            {copy.again}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn"
              data-variant="secondary"
              data-block
              onClick={onFastForward}
              data-tour="fast-forward"
              style={{ ["--btn-size" as string]: "0.8125rem" }}
            >
              {copy.fastForward}
              <span className="tag">{copy.demoTag}</span>
            </button>
            {car.status === "booked" && (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="btn" data-variant="ghost" onClick={onReschedule}>
                  {copy.reschedule}
                </button>
                <button type="button" className="btn" data-variant="ghost" onClick={onCancel}>
                  {copy.cancel}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
