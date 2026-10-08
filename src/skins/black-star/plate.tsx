/** Номерной знак в узбекском формате: регион | номер | UZ. Без флага и гербов. */
export function splitPlate(plate: string): { region: string; rest: string } {
  const m = plate.trim().match(/^(\d{2})\s*(.*)$/);
  return m ? { region: m[1], rest: m[2] } : { region: "01", rest: plate };
}

export function Plate({ plate, size = "m", className = "" }: { plate: string; size?: "s" | "m" | "l"; className?: string }) {
  const { region, rest } = splitPlate(plate);
  const fs = size === "s" ? "text-[0.8125rem]" : size === "l" ? "text-[1.375rem]" : "text-[0.9375rem]";
  return (
    <span
      className={`inline-flex items-stretch overflow-hidden rounded-[3px] bg-[#EDEDE8] font-mono font-semibold leading-none text-[#0A0A0B] tnum shadow-[inset_0_0_0_1.5px_#0A0A0B] ${fs} ${className}`}
    >
      <span className="flex items-center px-[0.4em] py-[0.32em] shadow-[1.5px_0_0_#0A0A0B]">{region}</span>
      <span className="flex items-center whitespace-nowrap px-[0.45em] py-[0.32em]">{rest}</span>
      <span className="flex items-center pr-[0.4em] text-[0.62em] tracking-[0.04em]">UZ</span>
    </span>
  );
}
