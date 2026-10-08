import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import type { BlackStarCopy } from "@brands/black-star";
import { getBrand, isBrandSlug } from "@brands/index";
import { defaultLocale, isLocale } from "@/i18n/config";
import { localizeBrand, localizeCopy } from "@/engine/brand-data";
import { ogFonts } from "@/og/fonts";
import { BlackStarOg } from "@/skins/black-star/og";

export const alt = "Демо-концепт";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  if (!isBrandSlug(slug)) return new Response("Not found", { status: 404 });
  const config = getBrand(slug);
  const brand = localizeBrand(config, locale);
  const fonts = await ogFonts();

  if (slug === "black-star") {
    const t = await getTranslations({ locale, namespace: "common" });
    return new ImageResponse(<BlackStarOg brand={brand} copy={localizeCopy<BlackStarCopy>(config, locale)} badge={t("demoBadge")} />, { ...size, fonts });
  }

  // Остальные бренды получат собственные обложки в своих фазах; пока — их цвета и заголовок.
  const c = config.theme.color;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: c.bg,
        color: c.ink,
        fontFamily: "Unbounded",
      }}
    >
      <div style={{ display: "flex", fontSize: 32, fontWeight: 900 }}>{config.name}</div>
      <div style={{ display: "flex", fontSize: 60, fontWeight: 900, lineHeight: 1.05, maxWidth: 980 }}>{brand.pitch.headline}</div>
      <div style={{ display: "flex", fontSize: 20, fontWeight: 500, color: c.muted }}>{brand.niche}</div>
    </div>,
    { ...size, fonts },
  );
}
