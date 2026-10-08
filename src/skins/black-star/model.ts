import type { DemoModel } from "@/engine/store/demo-store";
import { initCarwash, START, stepCarwash, type CarwashState } from "@/modules/queue/carwash";

export const carwashModel: DemoModel<CarwashState> = {
  key: "carwash",
  version: 3,
  seed: 20261008,
  start: START,
  init: (brand, seed) => initCarwash(brand, seed),
  step: (state, brand, rng, from, to, realDt) => stepCarwash(state, brand, rng, from, to, realDt),
};
