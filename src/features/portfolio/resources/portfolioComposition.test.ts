import { describe, expect, it } from "vitest";
import { PORTFOLIO_COMPOSITION } from "./portfolioComposition";

describe("portfolio composition resource", () => {
  it("keeps the approved image sequence and editorial landmarks explicit", () => {
    expect(PORTFOLIO_COMPOSITION.intro).toEqual({
      eyebrow: "Entropy / Chaos",
      title: "When I looked back, all I could see was mayhem.",
      description:
        "My combined body of work confronted me with more chaos. Static.",
    });
    expect(PORTFOLIO_COMPOSITION.sticky.photoId).toBe("ground-mirror-portrait");
    expect(PORTFOLIO_COMPOSITION.sticky.eyebrow).toBe(
      "Coincidence / Predestination",
    );
    expect(PORTFOLIO_COMPOSITION.sticky.title).toBe(
      "Everyone who has ever lived shared this single planet.",
    );
    expect(PORTFOLIO_COMPOSITION.sticky.description).toBe(
      "Was I placed here through sheer coincidence or predestination?",
    );
    expect(PORTFOLIO_COMPOSITION.parallax.photoId).toBe(
      "outdoor-crouching-reflection",
    );
    expect(PORTFOLIO_COMPOSITION.parallax.eyebrow).toBe("Order / Disorder");
    expect(PORTFOLIO_COMPOSITION.parallax.title).toBe(
      "Sharp geometry tears through the scenes.",
    );
    expect(PORTFOLIO_COMPOSITION.parallax.description).toBe(
      "And adds a contained order to each photo.",
    );
    expect(PORTFOLIO_COMPOSITION.release).toEqual({
      eyebrow: "At the center",
      title: "Something delightful and endlessly intriguing.",
      description:
        "A relentless whirlwind of possibilities that happened to align perfectly.",
    });
  });
});
