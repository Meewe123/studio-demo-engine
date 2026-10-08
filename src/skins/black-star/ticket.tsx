"use client";

import { Qr } from "@/ui/qr";
import { Plate } from "./plate";

export interface TicketData {
  no: string;
  time: string;
  post: number;
  service: string;
  plate: string;
  branch: string;
  qr: string;
}

/**
 * Талон в стиле парковочного билета: термобумага, перфорация сверху, отрыв снизу.
 * Печатается из «щели» ступенчатым движением, как из автомата.
 */
export function ParkingTicket({
  data,
  labels,
}: {
  data: TicketData;
  labels: { title: string; no: string; time: string; post: string; service: string; plate: string; qr: string };
}) {
  return (
    <div className="relative">
      {/* щель автомата */}
      <div className="relative z-10 mx-auto h-2 w-[94%] rounded-full bg-black shadow-[0_1px_0_rgba(255,255,255,.08)]" aria-hidden />
      <div className="-mt-1 overflow-hidden px-[3%] pb-4">
        <article className="bs-ticket relative origin-top text-[#0A0A0B]" aria-label={`${labels.title} ${labels.no}`}>
          <div className="bs-ticket-paper px-5 pt-6 pb-7">
            <div className="flex items-baseline justify-between font-mono text-[0.75rem] font-semibold tracking-[0.18em]">
              <span>BLACK STAR</span>
              <span className="tnum tracking-normal">{labels.no}</span>
            </div>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] opacity-70">{data.branch}</p>

            <dl className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2.5 border-y border-dashed border-[#0A0A0B]/40 py-4 font-mono">
              <dt className="text-[0.6875rem] uppercase tracking-[0.12em] opacity-70">{labels.time}</dt>
              <dd className="text-[2.25rem] font-semibold leading-none tnum">{data.time}</dd>
              <dt className="text-[0.6875rem] uppercase tracking-[0.12em] opacity-70">{labels.post}</dt>
              <dd className="text-xl font-semibold leading-none">{data.post}</dd>
              <dt className="text-[0.6875rem] uppercase tracking-[0.12em] opacity-70">{labels.service}</dt>
              <dd className="text-[0.9375rem] font-semibold uppercase leading-tight">{data.service}</dd>
              <dt className="text-[0.6875rem] uppercase tracking-[0.12em] opacity-70">{labels.plate}</dt>
              <dd>
                <Plate plate={data.plate} size="s" />
              </dd>
            </dl>

            <div className="mt-4 flex items-center gap-4">
              <Qr value={data.qr} className="size-[84px] shrink-0" fg="#0A0A0B" />
              <p className="font-mono text-[0.75rem] uppercase leading-snug tracking-[0.08em]">{labels.qr}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
