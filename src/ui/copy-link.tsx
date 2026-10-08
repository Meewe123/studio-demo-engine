"use client";

import { Check, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function CopyLink({ path, className = "" }: { path: string; className?: string }) {
  const t = useTranslations("showcase");
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t("copy"), url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className={`btn ${className}`} data-variant="secondary" data-size="s" aria-live="polite">
      {copied ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />}
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
