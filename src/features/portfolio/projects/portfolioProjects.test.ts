import { describe, expect, it } from "vitest";
import { getPortfolioProject, PORTFOLIO_PROJECTS } from "./portfolioProjects";

describe("portfolio project summaries", () => {
  it("keeps stable, unique project identities and routes", () => {
    const ids = PORTFOLIO_PROJECTS.map((project) => project.id);
    const slugs = PORTFOLIO_PROJECTS.map((project) => project.slug);
    const routes = PORTFOLIO_PROJECTS.map((project) => project.route);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("keeps secondary collections on short portfolio routes", () => {
    for (const project of PORTFOLIO_PROJECTS.filter(
      (project) => project.route !== "/",
    )) {
      expect(project.slug).toMatch(/^[a-z]+(?:-[a-z]+){0,3}$/);
      expect(project.slug.length).toBeLessThanOrEqual(32);
      if (project.destination !== undefined) {
        expect(project.destination.trim()).not.toBe("");
      }
      expect(project.route).toBe(`/portfolio/${project.slug}`);
      expect(getPortfolioProject(project.slug)).toEqual(project);
      expect(project.coverPhotoIds.landscape.trim()).not.toBe("");
      expect(project.coverPhotoIds.portrait.trim()).not.toBe("");
    }
  });

  it("supports a thematic Nature collection with one approved cover crop", () => {
    const nature = getPortfolioProject("nature");

    expect(nature).toMatchObject({
      title: "nature",
      route: "/portfolio/nature",
      coverPhotoIds: {
        landscape: "leaves-and-clouds-1",
        portrait: "leaves-and-clouds-1",
      },
    });
    expect(nature).not.toHaveProperty("destination");
  });
});
