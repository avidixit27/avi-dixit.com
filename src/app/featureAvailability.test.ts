import { describe, expect, it } from "vitest";
import {
  RELEASED_FEATURES,
  resolveFeatureAvailability,
} from "./featureAvailability";

describe("feature availability", () => {
  it("keeps the committed release state", () => {
    expect(resolveFeatureAvailability(RELEASED_FEATURES)).toEqual({
      shop: false,
      contact: true,
    });
  });

  it("releases each feature independently", () => {
    expect(resolveFeatureAvailability({ shop: true, contact: false })).toEqual({
      shop: true,
      contact: false,
    });
    expect(resolveFeatureAvailability({ shop: false, contact: true })).toEqual({
      shop: false,
      contact: true,
    });
    expect(resolveFeatureAvailability({ shop: true, contact: true })).toEqual({
      shop: true,
      contact: true,
    });
  });

  it("enables every known feature only for the explicit development override", () => {
    expect(resolveFeatureAvailability(RELEASED_FEATURES, true)).toEqual({
      shop: true,
      contact: true,
    });
  });
});
