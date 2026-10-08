"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useBrand } from "@/engine/brand-context";
import { Wordmark } from "./wordmark";

/** Временная страница для брендов, которые ещё не собраны: тема и тексты уже их, сценарий — позже. */
function Placeholder({ disclaimer }: { disclaimer: ReactNode }) {
  const brand = useBrand();
  const t = useTranslations("showcase");
  return (
    <main className={`texture-${brand.theme.texture} flex min-h-dvh flex-col px-5 py-8 md:px-12 md:py-12`}>
      <Wordmark slug={brand.slug} className="text-[1.5rem]" />
      <div className="my-auto max-w-[44rem] py-16">
        <p className="tag">{t("draft")}</p>
        <h1 className="type-display mt-6" style={{ fontSize: `clamp(${Math.max(2.5, brand.theme.display.min ?? 0)}rem, 7vw, 4.5rem)` }}>
          {brand.pitch.headline}
        </h1>
        <p className="pretty mt-6 text-lg text-muted">{brand.pitch.lede}</p>
        <Link href="/" className="btn mt-10" data-variant="secondary">
          ← {t("title")}
        </Link>
      </div>
      {disclaimer}
    </main>
  );
}

export const ClientStandalone = Placeholder;
export const OwnerStandalone = Placeholder;
export const Presentation = Placeholder;
export const Board = Placeholder;
