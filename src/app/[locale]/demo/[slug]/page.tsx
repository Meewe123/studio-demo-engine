import { notFound } from "next/navigation";
import { getBrand, isBrandSlug } from "@brands/index";
import { contactUrl } from "@/lib/site";
import { loadSkin } from "@/skins";
import { Disclaimer } from "@/ui/disclaimer";

export default async function PitchPage({ params }: PageProps<"/[locale]/demo/[slug]">) {
  const { slug } = await params;
  if (!isBrandSlug(slug)) notFound();
  const skin = await loadSkin(slug);
  return <skin.Presentation disclaimer={<Disclaimer company={getBrand(slug).name} />} contactUrl={contactUrl()} />;
}
