"use client";

import Script from "next/script";
import type { ReactNode } from "react";
import { useBrand } from "@/engine/brand-context";
import { DemoStoreProvider } from "@/engine/store/demo-store";
import { TelegramProvider } from "@/engine/telegram/use-telegram";
import { TELEGRAM_SCRIPT } from "@/engine/telegram/webapp";
import { BoardView } from "./board";
import { BlackStarClient } from "./client-app";
import { carwashModel } from "./model";
import { BlackStarOwner } from "./owner-app";

export { Presentation } from "./presentation";

/** /demo/black-star/app — полноэкранное приложение клиента и Telegram Mini App. */
export function ClientStandalone({ disclaimer }: { disclaimer: ReactNode }) {
  const brand = useBrand();
  return (
    <DemoStoreProvider model={carwashModel}>
      <TelegramProvider bg={brand.theme.color.bg}>
        <Script src={TELEGRAM_SCRIPT} strategy="afterInteractive" />
        <div className="mx-auto flex h-dvh max-w-[480px] flex-col [--app-top:env(safe-area-inset-top)]">
          <div className="min-h-0 flex-1">
            <BlackStarClient />
          </div>
          <div className="safe-x shrink-0 bg-bg pb-[max(8px,env(safe-area-inset-bottom))] text-center">{disclaimer}</div>
        </div>
      </TelegramProvider>
    </DemoStoreProvider>
  );
}

/** /demo/black-star/admin — пульт администратора на весь экран. */
export function OwnerStandalone({ disclaimer }: { disclaimer: ReactNode }) {
  return (
    <DemoStoreProvider model={carwashModel}>
      <div className="flex h-dvh flex-col [--app-top:env(safe-area-inset-top)]">
        <div className="min-h-0 flex-1">
          <BlackStarOwner boardHref="/demo/black-star/board" />
        </div>
        <div className="safe-x shrink-0 border-t border-line py-2">{disclaimer}</div>
      </div>
    </DemoStoreProvider>
  );
}

/** /demo/black-star/board — ТВ-табло в зале ожидания. */
export function Board({ disclaimer, appUrl }: { disclaimer: ReactNode; appUrl: string }) {
  return (
    <DemoStoreProvider model={carwashModel}>
      <div className="texture-wet-asphalt h-dvh overflow-hidden">
        <BoardView appUrl={appUrl} disclaimer={disclaimer} />
      </div>
    </DemoStoreProvider>
  );
}
