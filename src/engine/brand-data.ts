import type { Locale } from "@/i18n/config";
import { typo, typoTree } from "@/lib/typograf";
import type { BrandConfig, BrandTheme, L, ModuleId } from "@brands/types";

/** Бренд на одном языке — сериализуемые данные для клиентских компонентов. */
export interface BrandData {
  slug: string;
  name: string;
  niche: string;
  modules: ModuleId[];
  theme: BrandTheme;
  pitch: { headline: string; lede: string };
  branches: { id: string; name: string; address: string; capacity: number; hours: string }[];
  services: { id: string; name: string; note: string; price: number; priceFrom: boolean; duration: number }[];
  staff: { id: string; name: string; role: string; branchId?: string }[];
  effects: { value: string; label: string; basis: string }[];
}

export function loc(value: string | L | undefined, locale: Locale): string {
  if (value === undefined) return "";
  return typo(typeof value === "string" ? value : value[locale], locale);
}

export function localizeBrand(brand: BrandConfig, locale: Locale): BrandData {
  const l = (v: string | L | undefined) => loc(v, locale);
  return {
    slug: brand.slug,
    name: brand.name,
    niche: l(brand.niche),
    modules: brand.modules,
    theme: brand.theme,
    pitch: { headline: l(brand.pitch.headline), lede: l(brand.pitch.lede) },
    branches: brand.branches.map((b) => ({ id: b.id, name: l(b.name), address: l(b.address), capacity: b.capacity ?? 1, hours: b.hours })),
    services: brand.services.map((s) => ({
      id: s.id,
      name: l(s.name),
      note: l(s.note),
      price: s.price,
      priceFrom: s.priceFrom ?? false,
      duration: s.duration,
    })),
    staff: brand.staff.map((p) => ({ id: p.id, name: l(p.name), role: l(p.role), branchId: p.branchId })),
    effects: brand.effects.map((e) => ({ value: l(e.value), label: l(e.label), basis: l(e.basis) })),
  };
}

export function localizeCopy<C>(brand: BrandConfig, locale: Locale): C {
  return typoTree(brand.copy[locale], locale) as C;
}
