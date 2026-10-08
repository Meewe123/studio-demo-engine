import type { ReactNode } from "react";

/**
 * Рамка телефона для страницы-презентации (только ≥ 768 px).
 * На мобильном рамки нет: приложение занимает весь экран, «телефон в телефоне» не нужен.
 */
export function PhoneFrame({ children, className = "", label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <div className={`phone-frame relative ${className}`} role="group" aria-label={label}>
      <div className="phone-frame-screen relative h-full w-full overflow-hidden">
        <span
          className="phone-frame-island pointer-events-none absolute top-[10px] left-1/2 z-[60] h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black"
          aria-hidden
        />
        <div className="h-full w-full">{children}</div>
      </div>
    </div>
  );
}
