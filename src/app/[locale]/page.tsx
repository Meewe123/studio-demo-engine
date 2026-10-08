import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { brandSlugs, getBrand, type BrandSlug } from "@brands/index";
import { isLocale, type Locale } from "@/i18n/config";
import { localizeBrand } from "@/engine/brand-data";
import { BrandScope } from "@/engine/theme/brand-scope";
import { Wordmark } from "@/skins/wordmark";
import { CopyLink } from "@/ui/copy-link";
import { LangSwitch } from "@/ui/lang-switch";

export const metadata: Metadata = { title: "Витрина демо" };

/** Какие демо уже собраны полностью. */
const READY: BrandSlug[] = ["black-star"];

export default async function Showcase({ params }: PageProps<"/[locale]">) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ru";
  setRequestLocale(locale);
  const t = await getTranslations("showcase");

  return (
    <main className="min-h-dvh">
      <header className="safe-x mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-x-10 gap-y-6 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-[40rem]">
          <h1 className="type-display text-[clamp(2.75rem,7vw,5.5rem)]">{t("title")}</h1>
          <p className="pretty mt-4 max-w-[34rem] text-lg text-muted">{t("lede")}</p>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/styleguide" className="btn" data-variant="secondary" data-size="s">
            {t("styleguide")}
          </Link>
          <LangSwitch />
        </nav>
      </header>

      <ol className="flex flex-col">
        {brandSlugs.map((slug) => {
          const brand = localizeBrand(getBrand(slug), locale);
          const ready = READY.includes(slug);
          const hasBoard = brand.modules.includes("queue");
          const texture = `texture-${brand.theme.texture}`;
          return (
            <BrandScope key={slug} slug={slug} theme={brand.theme} as="li" className={`${texture} relative overflow-hidden`}>
              <article className="safe-x mx-auto grid max-w-[1400px] gap-8 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 md:py-14">
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)]">
                      <Wordmark slug={slug} />
                    </h2>
                    <p className="mt-3 text-muted">{brand.niche}</p>
                  </div>
                  <span className="tag self-start">{ready ? t("ready") : t("draft")}</span>
                </div>
                <div className="flex flex-col gap-7">
                  <p
                    className="type-display max-w-[22ch]"
                    style={{ fontSize: `clamp(${brand.theme.display.min ?? 1.75}rem, 3.6vw, ${Math.max(3, brand.theme.display.min ?? 0)}rem)` }}
                  >
                    {brand.pitch.headline}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/demo/${slug}`} className="btn" data-size="s">
                      {t("pitch")}
                    </Link>
                    <Link href={`/demo/${slug}?tour=1`} className="btn" data-variant="secondary" data-size="s">
                      {t("tour")}
                    </Link>
                    <Link href={`/demo/${slug}/app`} className="btn" data-variant="secondary" data-size="s">
                      {t("app")}
                    </Link>
                    <Link href={`/demo/${slug}/admin`} className="btn" data-variant="secondary" data-size="s">
                      {t("admin")}
                    </Link>
                    {hasBoard && (
                      <Link href={`/demo/${slug}/board`} className="btn" data-variant="secondary" data-size="s">
                        {t("board")}
                      </Link>
                    )}
                    <CopyLink path={`/demo/${slug}`} />
                  </div>
                </div>
              </article>
            </BrandScope>
          );
        })}
      </ol>
    </main>
  );
}
