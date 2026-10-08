import type { ComponentType, ReactNode } from "react";
import type { BrandSlug } from "@brands/index";

/** Что скин отдаёт движку. Каждый маршрут /demo/[slug]/* рендерит соответствующую часть. */
export interface Skin {
  ClientStandalone: ComponentType<{ disclaimer: ReactNode }>;
  OwnerStandalone: ComponentType<{ disclaimer: ReactNode }>;
  Board?: ComponentType<{ disclaimer: ReactNode; appUrl: string }>;
  Presentation: ComponentType<{ disclaimer: ReactNode; contactUrl: string }>;
}

const registry: Record<BrandSlug, () => Promise<Skin>> = {
  "black-star": () => import("./black-star"),
  darel: () => import("./placeholder"),
  "doctor-vet": () => import("./placeholder"),
  "expert-beauty": () => import("./placeholder"),
  "mr-gordons": () => import("./placeholder"),
};

export function loadSkin(slug: BrandSlug): Promise<Skin> {
  return registry[slug]();
}
