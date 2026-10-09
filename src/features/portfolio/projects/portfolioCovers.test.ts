import { describe, expect, it } from "vitest";
import { loadPortfolioCover } from "./portfolioCovers";
import { getPortfolioProject, PORTFOLIO_PROJECTS } from "./portfolioProjects";

describe("portfolio covers", () => {
  it.each([
    ["paris-fr", "landscape", "hand-holding-flowers"],
    ["paris-fr", "portrait", "hanging-shoes"],
    ["kerala", "landscape", "kochi-port-ocean-sky"],
    ["kerala", "portrait", "palm-tree-sunset"],
    ["nature", "landscape", "leaves-and-clouds-1"],
    ["nature", "portrait", "leaves-and-clouds-1"],
  ] as const)(
    "loads the approved %s %s cover without its full catalog",
    async (slug, orientation, photoId) => {
      const project = getPortfolioProject(slug);
      if (!project) throw new Error(`Missing portfolio project ${slug}`);

      await expect(
        loadPortfolioCover(project, orientation),
      ).resolves.toMatchObject({ id: photoId });
    },
  );

  it("returns no cover for a project without approved cover IDs", async () => {
    await expect(
      loadPortfolioCover(PORTFOLIO_PROJECTS[0], "landscape"),
    ).resolves.toBeUndefined();
  });
});
