"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BrandData } from "./brand-data";

interface BrandContextValue {
  data: BrandData;
  copy: unknown;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ data, copy, children }: BrandContextValue & { children: ReactNode }) {
  return <BrandContext.Provider value={{ data, copy }}>{children}</BrandContext.Provider>;
}

function useBrandContext(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("BrandProvider is missing");
  return ctx;
}

export function useBrand(): BrandData {
  return useBrandContext().data;
}

/** Тексты бренда на текущем языке. Тип — из конфига бренда (например, BlackStarCopy). */
export function useCopy<C>(): C {
  return useBrandContext().copy as C;
}
