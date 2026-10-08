import { notFound } from "next/navigation";
import { getBrand, isBrandSlug } from "@brands/index";
import { loadSkin } from "@/skins";
import { Disclaimer } from "@/ui/disclaimer";

export default async function AppPage({ params }: PageProps<"/[locale]/demo/[slug]/app">) {
  const { slug } = await params;
  if (!isBrandSlug(slug)) notFound();
  const skin = await loadSkin(slug);
  const disclaimer = <Disclaimer company={getBrand(slug).name} />;
  return <skin.ClientStandalone disclaimer={disclaimer} />;
}
