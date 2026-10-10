import { describe, expect, it } from "vitest";
import {
  HERO_CROSSFADE_DURATION_MS,
  HERO_IMAGE_SIZES,
  HERO_PHOTO_COUNT,
  HERO_ROTATION_DELAY_MS,
  LIGHTBOX_IMAGE_SIZES,
  LIGHTBOX_CLOSE_DURATION_MS,
  LIGHTBOX_CONTROL_CLEARANCE_REM,
  LIGHTBOX_IMAGE_TRANSITION_MS,
  LIGHTBOX_MAX_HEIGHT_VIEWPORT_PERCENT,
  LIGHTBOX_MAX_WIDTH_VIEWPORT_PERCENT,
  LIGHTBOX_PRELOAD_BACKWARD_COUNT,
  LIGHTBOX_PRELOAD_FORWARD_COUNT,
} from "./portfolioPresentationPolicy";

describe("portfolio presentation policy", () => {
  it("keeps approved hero timing and source selection", () => {
    expect(HERO_PHOTO_COUNT).toBe(10);
    expect(HERO_ROTATION_DELAY_MS).toBe(2500);
    expect(HERO_CROSSFADE_DURATION_MS).toBe(700);
    expect(HERO_IMAGE_SIZES).toBe("100vw");
  });

  it("keeps approved lightbox transition, preload, and viewport bounds", () => {
    expect(LIGHTBOX_IMAGE_TRANSITION_MS).toBe(200);
    expect(LIGHTBOX_CLOSE_DURATION_MS).toBe(300);
    expect(LIGHTBOX_PRELOAD_FORWARD_COUNT).toBe(1);
    expect(LIGHTBOX_PRELOAD_BACKWARD_COUNT).toBe(1);
    expect(LIGHTBOX_MAX_WIDTH_VIEWPORT_PERCENT).toBe(95);
    expect(LIGHTBOX_MAX_HEIGHT_VIEWPORT_PERCENT).toBe(95);
    expect(LIGHTBOX_CONTROL_CLEARANCE_REM).toBe(5);
    expect(LIGHTBOX_IMAGE_SIZES).toBe("95vw");
  });
});
