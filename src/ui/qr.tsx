import { encode } from "uqr";

/** QR-код как один SVG-path: чётко на любом экране и в OG-картинке. */
export function Qr({ value, className = "", fg = "currentColor" }: { value: string; className?: string; fg?: string }) {
  const { data, size } = encode(value, { ecc: "M", border: 1 });
  let d = "";
  data.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }),
  );
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} shapeRendering="crispEdges" aria-hidden>
      <path d={d} fill={fg} />
    </svg>
  );
}
