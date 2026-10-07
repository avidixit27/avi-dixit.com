import type { PortfolioProjectSummary } from "./portfolioProjects";

export type PortfolioCoverOrientation = "landscape" | "portrait";

export async function loadPortfolioCover(
  project: PortfolioProjectSummary,
  orientation: PortfolioCoverOrientation,
) {
  const photoId = project.coverPhotoIds?.[orientation];
  if (!photoId) return undefined;

  const { PORTFOLIO_COVER_CATALOG } = await import("./portfolioCoverCatalog");
  return PORTFOLIO_COVER_CATALOG[`${project.id}:${photoId}`];
}
