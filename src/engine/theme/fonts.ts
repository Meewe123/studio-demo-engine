import {
  Commissioner,
  Cormorant_Garamond,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Literata,
  Onest,
  Source_Code_Pro,
  Spectral,
  Unbounded,
  Ysabeau_Office,
} from "next/font/google";
import type { FontKey } from "@brands/types";

/*
 * Все шрифты проверены на кириллицу и узбекскую латиницу (ʻ U+02BB, ʼ U+02BC).
 * preload: false — на странице бренда скачиваются только его шрифты,
 * а подогнанный fallback держит CLS около нуля.
 */
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-unbounded", preload: false });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin", "cyrillic"], variable: "--font-source-code-pro", preload: false });
const literata = Literata({ subsets: ["latin", "cyrillic"], variable: "--font-literata", axes: ["opsz"], style: ["normal", "italic"], preload: false });
const ysabeauOffice = Ysabeau_Office({ subsets: ["latin", "cyrillic"], variable: "--font-ysabeau-office", preload: false });
const plexSans = IBM_Plex_Sans({ subsets: ["latin", "cyrillic"], variable: "--font-plex-sans", axes: ["wdth"], preload: false });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-plex-mono", weight: ["400", "500", "600"], preload: false });
const cormorant = Cormorant_Garamond({ subsets: ["latin", "cyrillic"], variable: "--font-cormorant", style: ["normal", "italic"], preload: false });
const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", preload: false });
const spectral = Spectral({
  subsets: ["latin", "cyrillic"],
  variable: "--font-spectral",
  weight: ["400", "600", "800"],
  style: ["normal", "italic"],
  preload: false,
});
const commissioner = Commissioner({ subsets: ["latin", "cyrillic"], variable: "--font-commissioner", preload: false });

const fonts = { unbounded, sourceCodePro, literata, ysabeauOffice, plexSans, plexMono, cormorant, onest, spectral, commissioner };

/** Классы, объявляющие CSS-переменные всех шрифтов. Файлы грузятся только при использовании. */
export const fontVariables = Object.values(fonts)
  .map((f) => f.variable)
  .join(" ");

/** CSS-переменная next/font для ключа шрифта из конфига бренда. */
export function fontVar(key: FontKey): string {
  const names: Record<FontKey, string> = {
    unbounded: "--font-unbounded",
    sourceCodePro: "--font-source-code-pro",
    literata: "--font-literata",
    ysabeauOffice: "--font-ysabeau-office",
    plexSans: "--font-plex-sans",
    plexMono: "--font-plex-mono",
    cormorant: "--font-cormorant",
    onest: "--font-onest",
    spectral: "--font-spectral",
    commissioner: "--font-commissioner",
  };
  return `var(${names[key]})`;
}
