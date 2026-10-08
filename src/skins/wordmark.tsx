import type { BrandSlug } from "@brands/index";

/**
 * Текстовые вордмарки. Логотипы компаний не используем — только набор.
 * Black Star — без звезды и любых символов: есть известный одноимённый бренд со звездой.
 */
export function Wordmark({ slug, className = "" }: { slug: BrandSlug | string; className?: string }) {
  switch (slug) {
    case "black-star":
      return <span className={`bs-chrome font-display font-black uppercase leading-none tracking-[0.04em] ${className}`}>Black Star</span>;
    case "darel":
      return (
        <span className={`font-display italic leading-none ${className}`} style={{ fontVariationSettings: '"opsz" 72', fontWeight: 600 }}>
          Darel
        </span>
      );
    case "doctor-vet":
      return (
        <span className={`font-display font-semibold leading-none tracking-[-0.02em] ${className}`}>
          Doctor<span className="text-accent">Vet</span>
        </span>
      );
    case "expert-beauty":
      return (
        <span className={`font-display italic leading-none tracking-[-0.01em] ${className}`} style={{ fontWeight: 500 }}>
          Expert Beauty
        </span>
      );
    case "mr-gordons":
      return (
        <span className={`relative inline-block font-display font-extrabold leading-none tracking-[-0.02em] ${className}`}>
          Mr.&nbsp;Gordon’s
          <svg aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-[0.28em] left-0 h-[0.22em] w-full text-signal">
            <path d="M2 8 C 40 3, 90 10, 130 5 S 190 4, 198 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      );
    default:
      return <span className={`font-display ${className}`}>{slug}</span>;
  }
}
