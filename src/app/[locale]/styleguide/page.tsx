import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Calendar, Car, Clock, MapPin, PawPrint, Phone, Receipt, Scissors, Send } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { brandSlugs, getBrand } from "@brands/index";
import type { FontKey } from "@brands/types";
import { isLocale, type Locale } from "@/i18n/config";
import { localizeBrand, loc } from "@/engine/brand-data";
import { BrandScope } from "@/engine/theme/brand-scope";
import { formatAmount } from "@/lib/format";
import { Wordmark } from "@/skins/wordmark";
import { LangSwitch } from "@/ui/lang-switch";
import { MotionSample } from "./motion-sample";

export const metadata: Metadata = { title: "Styleguide" };

const FONT_NAMES: Record<FontKey, string> = {
  unbounded: "Unbounded",
  sourceCodePro: "Source Code Pro",
  literata: "Literata",
  ysabeauOffice: "Ysabeau Office",
  plexSans: "IBM Plex Sans",
  plexMono: "IBM Plex Mono",
  cormorant: "Cormorant Garamond",
  onest: "Onest",
  spectral: "Spectral",
  commissioner: "Commissioner",
};

export default async function Styleguide({ params }: PageProps<"/[locale]/styleguide">) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ru";
  setRequestLocale(locale);
  const t = await getTranslations("styleguide");
  const tc = await getTranslations("common");

  return (
    <main className="min-h-dvh">
      <header className="safe-x mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 pt-10 pb-12 md:pt-16">
        <div>
          <Link href="/" className="text-sm text-muted underline-offset-4 hover:underline">
            ← Витрина
          </Link>
          <h1 className="type-display mt-4 text-[clamp(2.75rem,7vw,5.5rem)]">{t("title")}</h1>
          <p className="mt-3 max-w-[34rem] text-lg text-muted">{t("lede")}</p>
        </div>
        <LangSwitch />
      </header>

      {brandSlugs.map((slug) => {
        const config = getBrand(slug);
        const brand = localizeBrand(config, locale);
        const { theme } = config;
        const price = brand.services[1] ?? brand.services[0];
        return (
          <BrandScope key={slug} slug={slug} theme={theme} as="section" className={`texture-${theme.texture} border-t border-line`}>
            <div className="safe-x mx-auto max-w-[1400px] py-12 md:py-16">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="text-[clamp(2rem,4vw,3rem)]">
                  <Wordmark slug={slug} />
                </h2>
                <p className="text-sm text-muted">
                  {brand.niche}. {FONT_NAMES[theme.font.display]}
                  {theme.font.text !== theme.font.display && ` + ${FONT_NAMES[theme.font.text]}`}
                  {theme.font.mono !== theme.font.text && ` + ${FONT_NAMES[theme.font.mono]}`}
                </p>
              </div>

              <div className="mt-10 grid gap-x-12 gap-y-12 lg:grid-cols-2">
                {/* Палитра */}
                <div>
                  <h3 className="mb-4 text-sm text-muted">{t("palette")}</h3>
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                    {theme.swatches.map((s) => (
                      <li key={s.hex}>
                        <div className="aspect-[4/5] rounded-s" style={{ background: s.hex, boxShadow: "inset 0 0 0 1px rgba(127,127,127,.25)" }} />
                        <p className="mt-2 text-[0.8125rem] leading-tight">{loc(s.name, locale)}</p>
                        <p className="type-mono text-[0.75rem] text-muted">{s.hex}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Шрифты */}
                <div>
                  <h3 className="mb-4 text-sm text-muted">{t("type")}</h3>
                  <p className="type-display" style={{ fontSize: `clamp(${Math.max(2.5, theme.display.min ?? 0)}rem, 5vw, 3.75rem)` }}>
                    {brand.pitch.headline}
                  </p>
                  <p className="pretty mt-5 max-w-[60ch]">{brand.pitch.lede}</p>
                  <p className="pretty mt-3 max-w-[60ch] text-sm text-muted">{t("sample")}</p>
                  <p className="type-mono mt-4 text-2xl">18:40 &nbsp; 01 A 123 BC &nbsp; {formatAmount(price.price, locale)}</p>
                </div>

                {/* Компоненты */}
                <div>
                  <h3 className="mb-4 text-sm text-muted">{t("components")}</h3>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="btn">
                      {tc("cta")}
                    </button>
                    <button type="button" className="btn" data-variant="secondary">
                      {tc("about")}
                    </button>
                    <button type="button" className="btn" data-variant="ghost">
                      {tc("reset")}
                    </button>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t("components")}>
                    {brand.services.slice(0, 3).map((s, i) => (
                      <button key={s.id} type="button" className="chip" aria-pressed={i === 0}>
                        {s.name}
                      </button>
                    ))}
                    <button type="button" className="chip" disabled>
                      21:00
                    </button>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="field">
                      <span>{brand.branches[0].name}</span>
                      <input defaultValue={brand.branches[0].address} />
                    </label>
                    <div className="flex flex-col justify-end gap-3">
                      <div className="seg" role="group" aria-label={tc("views")}>
                        <button type="button" aria-pressed="true">
                          <span className="seg-thumb" aria-hidden />
                          {tc("client")}
                        </button>
                        <button type="button" aria-pressed="false">
                          {tc("owner")}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="tag">{tc("forecast")}</span>
                    <span className="tag">{brand.effects[0].value}</span>
                  </div>
                </div>

                {/* Форма и движение */}
                <div>
                  <h3 className="mb-4 text-sm text-muted">{t("shape")}</h3>
                  <div className="flex items-end gap-3">
                    {(["s", "m", "l"] as const).map((r) => (
                      <div key={r} className="flex flex-col items-center gap-2">
                        <div
                          className="h-16 w-16 bg-raised shadow-card"
                          style={{ borderRadius: `var(--r-${r})`, boxShadow: "var(--sh-card), inset 0 0 0 1px var(--c-line)" }}
                        />
                        <span className="type-mono text-xs text-muted">{theme.radius[r]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-ink" aria-label={t("stroke")}>
                    <Car size={24} aria-hidden />
                    <PawPrint size={24} aria-hidden />
                    <Receipt size={24} aria-hidden />
                    <Scissors size={24} aria-hidden />
                    <Calendar size={24} aria-hidden />
                    <Clock size={24} aria-hidden />
                    <MapPin size={24} aria-hidden />
                    <Bell size={24} aria-hidden />
                    <Phone size={24} aria-hidden />
                    <Send size={24} aria-hidden />
                    <span className="type-mono text-xs text-muted">{theme.icon.stroke}px</span>
                  </div>
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm text-muted">
                      {t("motion")}: {theme.motion.slow} ms, {theme.motion.ease}
                    </h3>
                    <MotionSample label={t("motion")} />
                  </div>
                </div>
              </div>
            </div>
          </BrandScope>
        );
      })}
    </main>
  );
}
