import { describe, expect, it } from "vitest";
import {
  MOTION_DEFAULT_TRANSITION,
  MOTION_EASE_OUT_CONTROL_POINTS,
  ROUTE_EXIT_OFFSET_PX,
  ROUTE_TRANSITION,
} from "./motionPresentationPolicy";

describe("motion presentation policy", () => {
  it("keeps the shared transition explicit", () => {
    expect(MOTION_EASE_OUT_CONTROL_POINTS).toEqual([0.22, 0.61, 0.36, 1]);
    expect(MOTION_DEFAULT_TRANSITION.duration).toBe(0.3);
  });

  it("keeps route exits short and spatially restrained", () => {
    expect(ROUTE_TRANSITION.duration).toBe(0.18);
    expect(ROUTE_EXIT_OFFSET_PX).toBe(-8);
  });
});
