"use client";

import { Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

/**
 * Уведомление в стиле пуша Telegram. Одинаковое для всех брендов —
 * это «чужой» интерфейс, поэтому бренд виден только в имени и тексте бота.
 */
export function TgNotice({ open, title, body, onClose, dark = true }: { open: boolean; title: string; body: string; onClose?: () => void; dark?: boolean }) {
  const t = useTranslations("telegram");
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          className="pointer-events-auto absolute inset-x-2 top-[calc(8px+var(--app-top,0px))] z-50"
          initial={{ y: -120, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          onClick={onClose}
        >
          <div
            className={`flex gap-3 rounded-[18px] p-3 pr-4 font-[system-ui,-apple-system,'Segoe_UI',sans-serif] shadow-[0_18px_40px_-12px_rgba(0,0,0,.55)] ${
              dark ? "bg-[#2a2a2e] text-white" : "bg-white text-[#0b0b0c]"
            }`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2AABEE] text-white">
              <Send size={18} strokeWidth={2} style={{ strokeWidth: 2 }} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2 text-[0.8125rem]">
                <b className="truncate font-semibold">{title}</b>
                <span className="shrink-0 opacity-60">{t("now")}</span>
              </span>
              <span className="mt-0.5 block text-[0.875rem] leading-snug opacity-90">{body}</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
