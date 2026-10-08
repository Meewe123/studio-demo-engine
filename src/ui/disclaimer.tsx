import { useTranslations } from "next-intl";

/** Плашка честности: на каждой странице демо. */
export function Disclaimer({ company, className = "" }: { company: string; className?: string }) {
  const t = useTranslations("common");
  return <p className={`text-[0.6875rem] leading-snug text-muted ${className}`}>{t("disclaimer", { company })}</p>;
}
