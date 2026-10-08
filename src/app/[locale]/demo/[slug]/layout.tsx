import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { brandSlugs, getBrand, isBrandSlug } from "@brands/index";
import { isLocale, type Locale } from "@/i18n/config";
import { localizeBrand, localizeCopy } from "@/engine/brand-data";
import { BrandProvider } from "@/engine/brand-context";
import { themeCss } from "@/engine/theme/css";

export function generateStaticParams() {
  return brandSlugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

async function resolve(params: Promise<{ locale: string; slug: string }>) {
  const { locale: rawLocale, slug } = await params;
  if (!isBrandSlug(slug) || !isLocale(rawLocale)) notFound();
  return { locale: rawLocale as Locale, slug, brand: getBrand(slug) };
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]/demo/[slug]">): Promise<Metadata> {
  const { locale, brand } = await resolve(params);
  const data = localizeBrand(brand, locale);
  const title = `${brand.name} — ${data.pitch.headline}`;
  return {
    title,
    description: data.pitch.lede,
    openGraph: { title, description: data.pitch.lede, type: "website", siteName: brand.name },
    twitter: { card: "summary_large_image", title, description: data.pitch.lede },
  };
}

export async function generateViewport({ params }: LayoutProps<"/[locale]/demo/[slug]">): Promise<Viewport> {
  const { brand } = await resolve(params);
  return { themeColor: brand.theme.color.bg, colorScheme: brand.theme.scheme };
}

export default async function DemoLayout({ children, params }: LayoutProps<"/[locale]/demo/[slug]">) {
  const { locale, slug, brand } = await resolve(params);
  setRequestLocale(locale);

  const css = `${themeCss(brand.theme, ":root")}html,body{background:var(--c-bg);color:var(--c-ink)}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <BrandProvider data={localizeBrand(brand, locale)} copy={localizeCopy(brand, locale)}>
        <div data-brand={slug} className="min-h-dvh">
          {children}
        </div>
      </BrandProvider>
    </>
  );
}
