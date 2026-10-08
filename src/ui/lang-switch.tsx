"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { LOCALE_COOKIE, localeLabels, locales, type Locale } from "@/i18n/config";

function saveLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

/** Переключатель языка: cookie + обновление страницы, URL остаётся чистым. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    saveLocale(next);
    startTransition(() => router.refresh());
  }

  return (
    <div role="group" aria-label={t("language")} aria-busy={pending} className={`inline-flex items-center gap-1 ${className}`}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l === "uz" ? "uz-Latn" : l}
          aria-pressed={l === locale}
          onClick={() => choose(l)}
          className="min-h-11 min-w-11 px-2 text-[0.8125rem] text-muted transition-colors aria-pressed:text-ink aria-pressed:underline aria-pressed:decoration-1 aria-pressed:underline-offset-[6px]"
        >
          {localeLabels[l].short}
        </button>
      ))}
    </div>
  );
}
