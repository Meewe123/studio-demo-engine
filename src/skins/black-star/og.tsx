import type { BlackStarCopy } from "@brands/black-star";
import type { BrandData } from "@/engine/brand-data";

const AMBER = "#FFB000";
const INK = "#E8E9EB";
const MUTED = "#8B9097";

function Flap({ text, size, color = AMBER }: { text: string; size: number; color?: string }) {
  return (
    <div style={{ display: "flex", gap: size * 0.08 }}>
      {[...text].map((ch, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: size * 0.86,
            height: size * 1.32,
            background: "linear-gradient(180deg, #202126 0%, #17181c 49%, #050506 50%, #141518 51%, #17181c 100%)",
            borderRadius: size * 0.06,
            color,
            fontFamily: "Source Code Pro",
            fontSize: size,
            fontWeight: 600,
          }}
        >
          {ch === " " ? "" : ch}
        </div>
      ))}
    </div>
  );
}

/** OG 1200×630: первое, что владелец увидит в превью Telegram или Instagram. */
export function BlackStarOg({ brand, copy, badge }: { brand: BrandData; copy: BlackStarCopy; badge: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0A0A0B",
        color: INK,
        fontFamily: "Unbounded",
        padding: "56px 64px",
      }}
    >
      {/* натриевый свет и отражения на мокром асфальте */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "radial-gradient(circle at 82% 0%, rgba(255,176,0,0.34), rgba(255,176,0,0.08) 35%, transparent 60%)",
        }}
      />
      {[180, 420, 760, 1010].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            bottom: -40,
            width: 26 + i * 6,
            height: 300,
            display: "flex",
            background: "linear-gradient(0deg, rgba(255,176,0,0.22), transparent)",
            borderRadius: 40,
            filter: "blur(10px)",
          }}
        />
      ))}

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 2,
              backgroundImage: "linear-gradient(178deg, #f7f8fa 0%, #c9cdd2 38%, #5d6168 52%, #e7e9ec 58%, #9ea3aa 78%, #f3f5f7 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            BLACK STAR
          </div>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 500, color: MUTED }}>{brand.niche}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 640,
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -2,
              backgroundImage: "linear-gradient(178deg, #ffffff 0%, #d9dce0 40%, #7d8188 55%, #eceef0 62%, #b5b9bf 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {brand.pitch.headline}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 500, color: MUTED }}>{copy.app.nearest}</div>
            <Flap text="18:20" size={64} />
            <Flap text={`${copy.board.ready}`} size={24} color={INK} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 500, color: MUTED }}>
          <div style={{ display: "flex" }}>{brand.branches.map((b) => b.name).join("  /  ")}</div>
          <div style={{ display: "flex", color: AMBER }}>{badge}</div>
        </div>
      </div>
    </div>
  );
}
