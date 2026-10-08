import type { StoreApi } from "zustand";
import type { BlackStarCopy } from "@brands/black-star";
import type { DemoState } from "@/engine/store/demo-store";
import type { TourStep } from "@/engine/tour/tour";
import { fill, hhmm } from "@/lib/format";
import { stageOf, type CarwashState } from "@/modules/queue/carwash";

/** Сценарий тура Black Star, ~35 секунд. Курсор нажимает настоящие кнопки. */
export function buildTour(copy: BlackStarCopy, api: StoreApi<DemoState<CarwashState>>, desktop: boolean): TourStep[] {
  const yours = () => {
    const s = api.getState();
    return s.model.cars.find((c) => c.id === s.model.you);
  };
  const stage = () => {
    const car = yours();
    return car ? stageOf(car, api.getState().now) : "waiting";
  };

  return [
    { do: "caption", text: copy.tour.c1 },
    { do: "wait", ms: 900 },
    { do: "tap", target: "pick-time" },
    { do: "caption", text: copy.tour.c2 },
    { do: "tap", target: "service-express" },
    { do: "tap", target: "slot-first" },
    { do: "wait", ms: 200 },
    { do: "tap", target: "confirm" },
    { do: "caption", text: copy.tour.c3 },
    { do: "wait", ms: 1700 },
    { do: "view", view: "owner" },
    { do: "caption", text: copy.tour.c4 },
    { do: "point", target: "feed-yours" },
    { do: "wait", ms: 1100 },
    { do: "point", target: "grid-yours" },
    { do: "wait", ms: 1000 },
    { do: "view", view: "client" },
    { do: "caption", text: () => fill(copy.tour.c5, { time: hhmm(yours()?.slot ?? 0) }) },
    { do: "tap", target: "fast-forward" },
    { do: "until", test: () => ["wash", "dry", "ready"].includes(stage()), timeout: 6000 },
    { do: "caption", text: copy.tour.c6 },
    ...(desktop ? ([{ do: "point", target: "board" }] as TourStep[]) : []),
    { do: "until", test: () => yours()?.status === "ready", timeout: 12000 },
    { do: "caption", text: copy.tour.c7 },
    { do: "wait", ms: 2600 },
  ];
}
