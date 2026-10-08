import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrand, isBrandSlug } from "@brands/index";
import { loadSkin } from "@/skins";
import { Disclaimer } from "@/ui/disclaimer";

export const metadata: Metadata = { title: "Пульт" };

export default async function AdminPage({ params }: PageProps<"/[locale]/demo/[slug]/admin">) {
  const { slug } = await params;
  if (!isBrandSlug(slug)) notFound();
  const skin = await loadSkin(slug);
  return <skin.OwnerStandalone disclaimer={<Disclaimer company={getBrand(slug).name} />} />;
}
