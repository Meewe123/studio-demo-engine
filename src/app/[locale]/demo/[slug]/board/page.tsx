import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrand, isBrandSlug } from "@brands/index";
import { siteUrl } from "@/lib/site";
import { loadSkin } from "@/skins";
import { Disclaimer } from "@/ui/disclaimer";

export const metadata: Metadata = { title: "Табло" };

/** Табло есть только у брендов с модулем queue. */
export default async function BoardPage({ params }: PageProps<"/[locale]/demo/[slug]/board">) {
  const { slug } = await params;
  if (!isBrandSlug(slug)) notFound();
  const brand = getBrand(slug);
  const skin = await loadSkin(slug);
  if (!brand.modules.includes("queue") || !skin.Board) notFound();
  return <skin.Board disclaimer={<Disclaimer company={brand.name} />} appUrl={`${siteUrl()}/demo/${slug}/app`} />;
}
