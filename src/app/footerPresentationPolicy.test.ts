import { describe, expect, it } from "vitest";
import {
  FOOTER_LANDING_OPACITY_START,
  FOOTER_LANDING_SETTLE_THRESHOLD_PX,
  FOOTER_LANDING_TIME_CONSTANT_MS,
  FOOTER_LANDING_ZONE_VIEWPORT_RATIO,
  FOOTER_PARALLAX_RATE,
  FOOTER_PARALLAX_SCROLL_OFFSETS,
  getFooterLandingFrame,
  getFooterLandingWheelPlan,
} from "./footerPresentationPolicy";

describe("footer presentation policy", () => {
  it("keeps the approved footer landing treatment explicit", () => {
    expect(FOOTER_PARALLAX_RATE).toBe(0.2);
    expect(FOOTER_PARALLAX_SCROLL_OFFSETS).toEqual(["start end", "end end"]);
    expect(FOOTER_LANDING_OPACITY_START).toBe(0.94);
    expect(FOOTER_LANDING_ZONE_VIEWPORT_RATIO).toBe(1);
    expect(FOOTER_LANDING_TIME_CONSTANT_MS).toBe(75);
    expect(FOOTER_LANDING_SETTLE_THRESHOLD_PX).toBe(0.5);
  });

  it("replays ordinary downward scrolling at 1:1 before the landing zone", () => {
    expect(
      getFooterLandingWheelPlan({
        deltaMode: 0,
        deltaY: 100,
        remainingDistance: 1_000,
        viewportHeight: 800,
      }),
    ).toEqual({ easedDelta: 0, immediateDelta: 100 });
  });

  it("leaves upward and completed scrolling outside the controller", () => {
    expect(
      getFooterLandingWheelPlan({
        deltaMode: 0,
        deltaY: -100,
        remainingDistance: 300,
        viewportHeight: 800,
      }),
    ).toBeNull();
    expect(
      getFooterLandingWheelPlan({
        deltaMode: 0,
        deltaY: 100,
        remainingDistance: 0,
        viewportHeight: 800,
      }),
    ).toBeNull();
  });

  it("eases only the part of a fast gesture inside the landing zone", () => {
    expect(
      getFooterLandingWheelPlan({
        deltaMode: 0,
        deltaY: 1_000,
        remainingDistance: 1_000,
        viewportHeight: 800,
      }),
    ).toEqual({ easedDelta: 800, immediateDelta: 200 });
  });

  it("normalizes line and page wheel deltas", () => {
    expect(
      getFooterLandingWheelPlan({
        deltaMode: 1,
        deltaY: 5,
        remainingDistance: 300,
        viewportHeight: 800,
      }),
    ).toEqual({ easedDelta: 80, immediateDelta: 0 });
    expect(
      getFooterLandingWheelPlan({
        deltaMode: 2,
        deltaY: 0.25,
        remainingDistance: 300,
        viewportHeight: 800,
      }),
    ).toEqual({ easedDelta: 200, immediateDelta: 0 });
  });

  it("eases toward the target consistently and lands exactly near it", () => {
    expect(
      getFooterLandingFrame({
        currentScrollY: 0,
        elapsedMs: 75,
        targetScrollY: 100,
      }),
    ).toBeCloseTo(63.212, 3);
    expect(
      getFooterLandingFrame({
        currentScrollY: 99.75,
        elapsedMs: 16,
        targetScrollY: 100,
      }),
    ).toBe(100);
  });

  it("does not advance without elapsed frame time", () => {
    expect(
      getFooterLandingFrame({
        currentScrollY: 25,
        elapsedMs: 0,
        targetScrollY: 100,
      }),
    ).toBe(25);
  });
});
