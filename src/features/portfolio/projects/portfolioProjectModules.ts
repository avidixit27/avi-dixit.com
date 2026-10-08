export const PORTFOLIO_PROJECT_MODULE_LOADERS = {
  "paris-fr": () => import("./paris-fr/ParisFrPortfolio"),
  kerala: () => import("./kerala/KeralaPortfolio"),
  nature: () => import("./nature/NaturePortfolio"),
} as const;

export async function preloadPortfolioProject(slug: string) {
  if (!Object.hasOwn(PORTFOLIO_PROJECT_MODULE_LOADERS, slug)) return false;

  await PORTFOLIO_PROJECT_MODULE_LOADERS[
    slug as keyof typeof PORTFOLIO_PROJECT_MODULE_LOADERS
  ]();
  return true;
}
