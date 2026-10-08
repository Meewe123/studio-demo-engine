import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // OG-картинка читает TTF с диска — явно кладём их в серверный бандл Vercel.
  outputFileTracingIncludes: {
    "/[locale]/demo/[slug]/opengraph-image": ["./src/og/fonts/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    // То же, что делает плагин next-intl, но без его зависимости от нативного @swc/core.
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
  // Демо не должны попадать в поиск: дублируем robots.txt и meta robots заголовком.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
