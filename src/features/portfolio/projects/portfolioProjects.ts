export interface PortfolioProjectSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly destination?: string;
  readonly route: string;
  readonly available: boolean;
}

export const PORTFOLIO_PROJECTS = Object.freeze([
  Object.freeze({
    id: "film",
    slug: "film",
    title: "entropy, chaos",
    route: "/",
    available: true,
  }),
  Object.freeze({
    id: "paris-fr",
    slug: "paris-fr",
    title: "paris",
    destination: "france",
    route: "/portfolio/paris-fr",
    available: true,
  }),
  Object.freeze({
    id: "kerala",
    slug: "kerala",
    title: "kerala",
    destination: "india",
    route: "/portfolio/kerala",
    available: true,
  }),
] as const satisfies readonly PortfolioProjectSummary[]);

export function getPortfolioProject(slug: string) {
  return PORTFOLIO_PROJECTS.find(
    (project) =>
      project.slug === slug && project.route !== "/" && project.available,
  );
}
