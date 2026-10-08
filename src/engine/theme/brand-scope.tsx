import type { CSSProperties, ReactNode } from "react";
import type { BrandTheme } from "@brands/types";
import { themeVars } from "./css";

/** Обёртка, внутри которой действуют токены бренда (для витрины и styleguide). */
export function BrandScope({
  slug,
  theme,
  className = "",
  children,
  as: Tag = "div",
}: {
  slug: string;
  theme: BrandTheme;
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag data-brand={slug} style={{ ...themeVars(theme), colorScheme: theme.scheme } as CSSProperties} className={`bg-bg text-ink ${className}`}>
      {children}
    </Tag>
  );
}
