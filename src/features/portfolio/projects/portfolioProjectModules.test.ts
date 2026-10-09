import { describe, expect, it } from "vitest";
import { preloadPortfolioProject } from "./portfolioProjectModules";

describe("portfolio project module preloading", () => {
  it.each(["paris-fr", "kerala", "nature"])(
    "preloads the %s route",
    async (slug) => {
      await expect(preloadPortfolioProject(slug)).resolves.toBe(true);
    },
  );

  it("rejects unknown portfolio routes", async () => {
    await expect(preloadPortfolioProject("missing")).resolves.toBe(false);
  });
});
