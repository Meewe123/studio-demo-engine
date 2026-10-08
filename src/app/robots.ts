import type { MetadataRoute } from "next";

/**
 * Индексация запрещена всем. Исключение — боты превью ссылок (Telegram, Instagram/Facebook),
 * иначе владелец увидит пустую карточку вместо OG-картинки. Они не индексируют страницы.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: ["TelegramBot", "facebookexternalhit", "Facebot", "WhatsApp"], allow: "/" },
      { userAgent: "*", disallow: "/" },
    ],
  };
}
