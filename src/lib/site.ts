/** Абсолютный адрес сайта — нужен для OG-картинок в превью Telegram и Instagram. */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Ссылка «Обсудить внедрение»: @username, username или полный URL. */
export function contactUrl(): string {
  const raw = process.env.NEXT_PUBLIC_CONTACT_TG?.trim() || "your_studio";
  if (/^https?:\/\//.test(raw)) return raw;
  return `https://t.me/${raw.replace(/^@/, "")}`;
}
