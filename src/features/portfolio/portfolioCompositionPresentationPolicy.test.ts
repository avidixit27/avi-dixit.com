import { describe, expect, it } from "vitest";
import { PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT } from "./portfolioCompositionPresentationPolicy";

describe("portfolio composition presentation policy", () => {
  it("keeps the approved image-drift bound explicit", () => {
    expect(PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT).toBe(12);
  });
});
