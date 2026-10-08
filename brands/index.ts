import blackStar from "./black-star";
import darel from "./darel";
import doctorVet from "./doctor-vet";
import expertBeauty from "./expert-beauty";
import mrGordons from "./mr-gordons";
import type { BrandConfig } from "./types";

/** Реестр брендов. Новый бренд = новый файл в brands/ + строка здесь + скин. */
export const brands = {
  "black-star": blackStar,
  darel,
  "doctor-vet": doctorVet,
  "expert-beauty": expertBeauty,
  "mr-gordons": mrGordons,
} satisfies Record<string, BrandConfig>;

export type BrandSlug = keyof typeof brands;
export const brandSlugs = Object.keys(brands) as BrandSlug[];

export function isBrandSlug(value: string): value is BrandSlug {
  return value in brands;
}

export function getBrand(slug: BrandSlug): BrandConfig {
  return brands[slug] as unknown as BrandConfig;
}

export type { BrandConfig } from "./types";
