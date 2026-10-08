import type { Locale } from "@/i18n/config";

/** Строка на трёх языках. Узбекский — латиница, oʻ/gʻ через U+02BB. */
export type L = Record<Locale, string>;

export type ModuleId = "queue" | "booking" | "crm" | "leads" | "bot" | "reminders" | "levelTest";

export type FontKey =
  "unbounded" | "sourceCodePro" | "literata" | "ysabeauOffice" | "plexSans" | "plexMono" | "cormorant" | "onest" | "spectral" | "commissioner";

export type Texture = "wet-asphalt" | "paper-grain" | "clinical-grid" | "gloss" | "ruled";

/**
 * Дизайн-токены бренда. Это не только цвета: шкала и характер шрифта,
 * радиусы, линии, тени и движение тоже принадлежат бренду.
 */
export interface BrandTheme {
  scheme: "dark" | "light";
  color: {
    bg: string;
    surface: string;
    raised: string;
    line: string;
    ink: string;
    muted: string;
    accent: string;
    onAccent: string;
    accentSoft: string;
    signal: string;
    onSignal: string;
    mark: string;
    focus: string;
  };
  font: { display: FontKey; text: FontKey; mono: FontKey };
  display: {
    weight: number;
    tracking: string;
    leading: number;
    style: "normal" | "italic";
    /** Минимальный кегль крупного заголовка, rem. Expert Beauty: Cormorant 300 — только от 48 px. */
    min?: number;
    /** font-variation-settings для заголовков, например оптический размер Literata. */
    variation?: string;
  };
  text: { weight: number; leading: number; strong: number };
  radius: { s: string; m: string; l: string };
  line: { hair: string; rule: string };
  shadow: { card: string; pop: string };
  motion: { ease: string; easeOut: string; fast: number; base: number; slow: number };
  icon: { stroke: number };
  texture: Texture;
  /** Именованная палитра для styleguide. */
  swatches: { name: L; hex: string }[];
}

export interface Branch {
  id: string;
  name: L;
  address: L;
  /** Количество постов/кабинетов — для очереди. */
  capacity?: number;
  hours: string;
}

export interface Service {
  id: string;
  name: L;
  note?: L;
  price: number;
  priceFrom?: boolean;
  /** Минуты. */
  duration: number;
}

export interface Staff {
  id: string;
  name: L;
  role: L;
  branchId?: string;
}

/** Эффект на странице-презентации. Всегда прогноз, не факт. */
export interface Effect {
  value: string | L;
  label: L;
  basis: L;
}

export interface CopyTree {
  [key: string]: string | CopyTree;
}

export interface BrandConfig<C extends CopyTree = CopyTree> {
  slug: string;
  /** Текстовый вордмарк. Логотипы компаний не используем. */
  name: string;
  niche: L;
  modules: ModuleId[];
  theme: BrandTheme;
  pitch: { headline: L; lede: L };
  branches: Branch[];
  services: Service[];
  staff: Staff[];
  effects: Effect[];
  copy: Record<Locale, C>;
}

export function defineBrand<C extends CopyTree>(config: BrandConfig<C>): BrandConfig<C> {
  return config;
}
