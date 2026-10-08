import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, locales } from "@/i18n/config";

/**
 * Язык не попадает в URL: /demo/black-star остаётся чистой ссылкой для владельца.
 * Внутри запрос переписывается на /{locale}/..., чтобы страницы оставались статичными.
 * ?lang=uz — открыть демо сразу на нужном языке (запоминается в cookie).
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const first = pathname.split("/")[1];
  if ((locales as readonly string[]).includes(first)) return NextResponse.next();

  const fromParam = searchParams.get("lang");
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(fromParam) ? fromParam : isLocale(fromCookie) ? fromCookie : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);

  if (isLocale(fromParam) && fromParam !== fromCookie) {
    response.cookies.set(LOCALE_COOKIE, fromParam, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|robots.txt|favicon.ico|.*\\..*).*)"],
};
