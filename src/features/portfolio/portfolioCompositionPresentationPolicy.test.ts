import { describe, expect, it } from "vitest";
import {
  PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT,
  PORTFOLIO_COMPOSITION_STICKY_BREAKPOINT_PX,
} from "./portfolioCompositionPresentationPolicy";

describe("portfolio composition presentation policy", () => {
  it("keeps the approved sticky and parallax bounds explicit", () => {
    expect(PORTFOLIO_COMPOSITION_STICKY_BREAKPOINT_PX).toBe(768);
    expect(PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT).toBe(12);
  });
});
