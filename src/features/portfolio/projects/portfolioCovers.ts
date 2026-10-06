import type { Photo } from "../photoTypes";
import type { PortfolioProjectSummary } from "./portfolioProjects";

export type PortfolioCoverOrientation = "landscape" | "portrait";

const catalogLoaders = {
  "paris-fr": async () =>
    (await import("./paris-fr/photoCatalog")).PARIS_FR_PHOTO_CATALOG,
  kerala: async () =>
    (await import("./kerala/photoCatalog")).KERALA_PHOTO_CATALOG,
} satisfies Record<string, () => Promise<readonly Photo[]>>;

export async function loadPortfolioCover(
  project: PortfolioProjectSummary,
  orientation: PortfolioCoverOrientation,
) {
  const photoId = project.coverPhotoIds?.[orientation];
  const loadCatalog = catalogLoaders[project.id as keyof typeof catalogLoaders];
  if (!photoId || !loadCatalog) return undefined;

  return (await loadCatalog()).find((photo) => photo.id === photoId);
}
