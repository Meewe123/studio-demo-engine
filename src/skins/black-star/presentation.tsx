"use client";

import { Info, RotateCcw, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { BlackStarCopy } from "@brands/black-star";
import { useBrand, useCopy } from "@/engine/brand-context";
import { DemoStoreProvider, useDemoApi } from "@/engine/store/demo-store";
import { TelegramProvider } from "@/engine/telegram/use-telegram";
import { TourButton, TourHud, TourProvider, useTour } from "@/engine/tour/tour";
import type { CarwashState } from "@/modules/queue/carwash";
import { Wordmark } from "@/skins/wordmark";
import { LangSwitch } from "@/ui/lang-switch";
import { PhoneFrame } from "@/ui/phone-frame";
import { isLowPower, useMedia } from "@/ui/use-media";
import { BoardView, PostRows } from "./board";
import { BlackStarClient } from "./client-app";
import { Flap } from "./flap";
import { carwashModel } from "./model";
import { BlackStarOwner } from "./owner-app";
import { buildTour } from "./tour";
import { useClientUi } from "./ui-store";

const WetAsphalt = dynamic(() => import("./wet-asphalt").then((m) => m.WetAsphalt), { ssr: false });

type View = "client" | "owner";

export function Presentation({ disclaimer, contactUrl }: { disclaimer: ReactNode; contactUrl: string }) {
  const brand = useBrand();
  return (
    <DemoStoreProvider model={carwashModel}>
      <TelegramProvider bg={brand.theme.color.bg} embedded>
        <Stage disclaimer={disclaimer} contactUrl={contactUrl} />
      </TelegramProvider>
    </DemoStoreProvider>
  );
}

function Stage({ disclaimer, contactUrl }: { disclaimer: ReactNode; contactUrl: string }) {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>();
  const api = useDemoApi<CarwashState>();
  const desktop = useMedia("(min-width: 768px)");
  // Табло и пульт не нужны на телефоне до переключения — не гидрируем лишнее.
  const wide = useMedia("(min-width: 1280px)");
  const [view, setView] = useState<View>("client");
  const [autoplay, setAutoplay] = useState(false);
  // Обложка приходит в HTML с сервера: на телефоне это первый кадр и LCP.
  const [cover, setCover] = useState(true);
  const [branch, setBranch] = useState(brand.branches[0].id);

  useEffect(() => {
    const tour = new URLSearchParams(window.location.search).get("tour") === "1";
    let seen = false;
    try {
      seen = window.sessionStorage.getItem("bs-cover") === "1";
    } catch {
      /* sessionStorage недоступен */
    }
    const id = window.setTimeout(() => {
      setAutoplay(tour);
      if (seen) setCover(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const closeCover = () => {
    setCover(false);
    try {
      window.sessionStorage.setItem("bs-cover", "1");
    } catch {
      /* ничего страшного */
    }
  };

  const build = useCallback(() => buildTour(copy, api, desktop), [copy, api, desktop]);
  const prepare = useCallback(() => {
    api.getState().reset();
    useClientUi.getState().reset(brand.branches[0].id);
    setBranch(brand.branches[0].id);
    setCover(false);
  }, [api, brand.branches]);

  return (
    <TourProvider build={build} prepare={prepare} onView={setView} autoplay={autoplay} touch={!desktop}>
      <main className="bs-pres relative min-h-dvh overflow-x-clip">
        {/* ---------- Десктоп: шапка и заголовок ---------- */}
        <header className="relative z-10 mx-auto hidden max-w-[1520px] items-center justify-between gap-6 px-10 pt-6 md:flex">
          <Wordmark slug="black-star" className="text-[1.25rem]" />
          <div className="flex items-center gap-4">
            <TourButton />
            <LangSwitch />
          </div>
        </header>

        <section className="relative">
          <WetAsphaltLayer />
          <div className="relative z-10 mx-auto grid max-w-[1520px] gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:px-10 md:pt-8 md:pb-40 xl:grid-cols-[minmax(0,1fr)_390px_minmax(0,1fr)] xl:gap-10">
            {/* Левая колонка: заголовок, тур, табло */}
            <div className="hidden flex-col md:col-span-2 md:flex xl:col-span-1">
              <h1 className="type-display bs-chrome text-[clamp(2.25rem,3.5vw,3.6rem)]">{brand.pitch.headline}</h1>
              <p className="pretty mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-muted">{brand.pitch.lede}</p>
              <div className="mt-auto hidden pt-10 xl:block" data-tour="board">
                <p className="mb-3 text-[0.75rem] text-muted">{copy.pitch.stageBoard}</p>
                <div className="bs-panel min-h-[318px] overflow-hidden">{wide && <BoardView branchId={branch} compact />}</div>
              </div>
            </div>

            {/* Телефон: на мобильном — весь экран */}
            <div className="md:flex md:flex-col md:items-center">
              <p className="mb-3 hidden self-start text-[0.75rem] text-muted md:block xl:self-center">{copy.pitch.stagePhone}</p>
              <PhoneFrame
                label={copy.pitch.stagePhone}
                className={`bs-phone fixed inset-0 z-20 h-dvh w-full md:relative md:inset-auto md:z-auto md:h-[min(800px,calc(100dvh-140px))] md:min-h-[640px] md:w-[390px] ${view === "owner" || cover ? "max-md:invisible" : ""}`}
              >
                <BlackStarClient />
              </PhoneFrame>
              <div className="pointer-events-none mx-auto -mt-6 hidden h-12 w-[320px] rounded-[50%] bg-accent/20 blur-2xl md:block" aria-hidden />
            </div>

            {/* Пульт владельца: на мобильном — второй полноэкранный режим */}
            <div className="md:flex md:flex-col">
              <p className="mb-3 hidden text-[0.75rem] text-muted md:block">{copy.pitch.stageOwner}</p>
              <div
                className={`bs-owner fixed inset-0 z-20 h-dvh md:relative md:inset-auto md:z-auto md:h-[min(800px,calc(100dvh-140px))] md:min-h-[640px] md:overflow-hidden md:shadow-[0_0_0_1px_var(--c-line)] ${view === "owner" ? "" : "max-md:hidden"}`}
                inert={!desktop && view !== "owner" ? true : undefined}
              >
                {(desktop || view === "owner") && <BlackStarOwner branchId={branch} onBranch={setBranch} boardHref="/demo/black-star/board" embedded />}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Десктоп: что меняется + CTA ---------- */}
        <div className="relative z-10 mx-auto hidden max-w-[1520px] px-10 pb-12 md:block">
          <Effects />
          <Cta contactUrl={contactUrl} />
          <div className="mt-12 border-t border-line pt-5">{disclaimer}</div>
        </div>

        {/* ---------- Мобильный: док, обложка, шторка ---------- */}
        <MobileDock view={view} onView={setView} contactUrl={contactUrl} disclaimer={disclaimer} />
        <AnimatePresence>{cover && <Cover onClose={closeCover} />}</AnimatePresence>

        <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] hidden justify-center px-3 md:flex">
          <TourHud
            className="bs-hud pointer-events-auto w-full max-w-[640px] px-4 py-3"
            captionClassName="font-display text-[1.0625rem] font-medium leading-snug"
          />
        </div>
        <EndCard contactUrl={contactUrl} />
      </main>
    </TourProvider>
  );
}

function WetAsphaltLayer() {
  const desktop = useMedia("(min-width: 768px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!desktop || reduced || isLowPower()) return;
    const start = () => setEnabled(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 2500 });
      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, [desktop, reduced]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-0 hidden md:block" aria-hidden>
      <div className="texture-wet-asphalt absolute inset-0" />
      <div className="bs-reflections absolute inset-x-0 bottom-0 h-[55%]" />
      {enabled && <WetAsphalt />}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}

function Effects() {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>();
  const t = useTranslations("common");
  return (
    <section className="mt-6" aria-labelledby="bs-effects">
      <h2 id="bs-effects" className="type-display text-[2rem]">
        {copy.pitch.effectsTitle}
      </h2>
      <ul className="mt-6 flex flex-col">
        {brand.effects.map((e) => (
          <li key={e.label} className="grid items-center gap-x-8 gap-y-2 border-t border-line py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto]">
            <span className="text-[2.25rem] [--flap-ink:var(--c-accent)]">
              <Flap text={e.value} label={e.value} steps={2} />
            </span>
            <div>
              <p className="font-display text-[1.25rem] font-medium">{e.label}</p>
              <p className="mt-1 text-[0.875rem] text-muted">{e.basis}</p>
            </div>
            <span className="tag justify-self-start md:justify-self-end">{t("forecast")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cta({ contactUrl }: { contactUrl: string }) {
  const copy = useCopy<BlackStarCopy>();
  const t = useTranslations("common");
  return (
    <section className="bs-panel mt-14 grid items-end gap-8 p-8 md:grid-cols-[minmax(0,1fr)_auto] md:p-12">
      <div>
        <h2 className="type-display bs-chrome text-[clamp(2rem,3.4vw,3rem)]">{copy.pitch.ctaTitle}</h2>
        <p className="pretty mt-4 max-w-[38rem] text-muted">{copy.pitch.ctaText}</p>
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <a href={contactUrl} target="_blank" rel="noreferrer" className="btn" style={{ ["--btn-h" as string]: "64px", ["--btn-size" as string]: "1rem" }}>
          <Send size={18} aria-hidden />
          {t("cta")}
        </a>
        <span className="text-[0.75rem] text-muted">{t("ctaNote")}</span>
      </div>
    </section>
  );
}

function MobileDock({ view, onView, contactUrl, disclaimer }: { view: View; onView: (v: View) => void; contactUrl: string; disclaimer: ReactNode }) {
  const t = useTranslations("common");
  const dialog = useRef<HTMLDialogElement>(null);
  const tour = useTour();
  const touring = tour.status === "playing" || tour.status === "paused";
  return (
    <>
      <div
        className="bs-dock fixed inset-x-0 top-0 z-40 flex min-h-[60px] items-center gap-2 px-3 pt-[max(8px,env(safe-area-inset-top))] pb-2 md:hidden"
        data-tour-hud
      >
        {touring ? (
          <TourHud className="w-full" captionClassName="font-display text-[0.8125rem] font-medium leading-snug line-clamp-2" />
        ) : (
          <>
            <div className="seg flex-1" role="group" aria-label={t("views")}>
              {(["client", "owner"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => onView(v)} className="relative !min-h-10">
                  {view === v && <motion.span layoutId="bs-dock-view" className="seg-thumb" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <span className="relative">{t(v)}</span>
                </button>
              ))}
            </div>
            <TourButton compact className="!min-h-11 !px-3" />
            <button type="button" className="btn !min-h-11 !px-3" data-variant="secondary" aria-label={t("about")} onClick={() => dialog.current?.showModal()}>
              <Info size={18} aria-hidden />
            </button>
          </>
        )}
      </div>
      <AboutSheet ref={dialog} contactUrl={contactUrl} disclaimer={disclaimer} />
    </>
  );
}

function AboutSheet({ ref, contactUrl, disclaimer }: { ref: React.Ref<HTMLDialogElement>; contactUrl: string; disclaimer: ReactNode }) {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>();
  const t = useTranslations("common");
  const tour = useTour();
  const close = (e: React.MouseEvent) => (e.currentTarget.closest("dialog") as HTMLDialogElement | null)?.close();
  return (
    <dialog
      ref={ref}
      className="bs-sheet m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto bg-surface p-0 text-ink backdrop:bg-black/70"
      aria-label={t("about")}
    >
      <div className="px-5 pt-5 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <Wordmark slug="black-star" className="text-[1rem]" />
          <button type="button" onClick={close} className="btn !min-h-11 !px-3" data-variant="ghost" aria-label={t("close")}>
            <X size={20} aria-hidden />
          </button>
        </div>
        <h2 className="type-display bs-chrome mt-5 text-[clamp(1.625rem,8vw,2rem)]">{brand.pitch.headline}</h2>
        <p className="pretty mt-3 text-[0.9375rem] text-muted">{brand.pitch.lede}</p>
        <h3 className="mt-7 font-display text-[1rem] font-semibold">{copy.pitch.effectsTitle}</h3>
        <ul className="mt-2">
          {brand.effects.map((e) => (
            <li key={e.label} className="border-t border-line py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="type-mono text-[1.75rem] font-semibold text-accent">{e.value}</span>
                <span className="tag">{t("forecast")}</span>
              </div>
              <p className="mt-1 text-[0.9375rem]">{e.label}</p>
              <p className="mt-0.5 text-[0.8125rem] text-muted">{e.basis}</p>
            </li>
          ))}
        </ul>
        <a href={contactUrl} target="_blank" rel="noreferrer" className="btn mt-6" data-block>
          <Send size={18} aria-hidden />
          {t("cta")}
        </a>
        <p className="mt-2 text-center text-[0.75rem] text-muted">{t("ctaNote")}</p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <LangSwitch />
          <button
            type="button"
            className="btn"
            data-variant="ghost"
            data-size="s"
            onClick={(e) => {
              close(e);
              tour.start();
            }}
          >
            <RotateCcw size={14} aria-hidden />
            {t("reset")}
          </button>
        </div>
        <div className="mt-5">{disclaimer}</div>
      </div>
    </dialog>
  );
}

function Cover({ onClose }: { onClose: () => void }) {
  const brand = useBrand();
  const copy = useCopy<BlackStarCopy>();
  const tour = useTour();
  const t = useTranslations("tour");
  return (
    <motion.div
      className="texture-wet-asphalt fixed inset-0 z-[80] flex flex-col bg-bg px-5 pt-[max(24px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] md:hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.35, ease: [0.7, 0, 0.2, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={brand.name}
      data-tour-hud
    >
      <div className="bs-rise">
        <Wordmark slug="black-star" className="text-[1.375rem]" />
      </div>
      <div className="bs-rise mt-8 text-[clamp(0.85rem,4.2vw,1.05rem)] [--flap-bg:#17181c]" style={{ animationDelay: "250ms" }} aria-hidden>
        <p className="mb-3 font-display text-[0.75rem] text-muted">
          {copy.app.nowOnPosts}, {brand.branches[0].name}
        </p>
        <PostRows />
      </div>
      <div className="mt-auto pt-8">
        <h1 className="bs-rise type-display bs-chrome text-[clamp(2.125rem,10vw,3rem)]" style={{ animationDelay: "100ms" }}>
          {brand.pitch.headline}
        </h1>
        <p className="bs-rise pretty mt-5 text-[1rem] leading-relaxed text-muted" style={{ animationDelay: "220ms" }}>
          {brand.pitch.lede}
        </p>
        <div className="bs-rise mt-8 flex flex-col gap-2" style={{ animationDelay: "340ms" }}>
          <button
            type="button"
            className="btn"
            data-block
            onClick={() => {
              onClose();
              tour.start();
            }}
          >
            {t("play")}
            <span className="font-mono text-[0.75rem] opacity-70">{t("length")}</span>
          </button>
          <button type="button" className="btn" data-variant="secondary" data-block onClick={onClose}>
            {t("tryYourself")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EndCard({ contactUrl }: { contactUrl: string }) {
  const tour = useTour();
  const copy = useCopy<BlackStarCopy>();
  const t = useTranslations("tour");
  const tc = useTranslations("common");
  return (
    <AnimatePresence>
      {tour.status === "ended" && (
        <motion.div
          className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-[75] mx-auto max-w-[720px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          data-tour-hud
          role="dialog"
          aria-label={copy.tour.end}
        >
          <div className="bs-panel bs-hud flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <p className="type-display bs-chrome text-[1.5rem] md:text-[1.75rem]">{copy.tour.end}</p>
            <div className="flex gap-2">
              <button type="button" className="btn" data-variant="secondary" onClick={tour.start}>
                <RotateCcw size={16} aria-hidden />
                {t("replay")}
              </button>
              <a href={contactUrl} target="_blank" rel="noreferrer" className="btn">
                <Send size={16} aria-hidden />
                {tc("cta")}
              </a>
              <button type="button" className="btn" data-variant="ghost" aria-label={tc("close")} onClick={tour.skip}>
                <X size={18} aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
