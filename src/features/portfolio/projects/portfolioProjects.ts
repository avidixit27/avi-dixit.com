export interface PortfolioProjectSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly destination?: string;
  readonly route: string;
  readonly available: boolean;
  readonly coverPhotoIds?: {
    readonly landscape: string;
    readonly portrait: string;
  };
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
    coverPhotoIds: {
      landscape: "hand-holding-flowers",
      portrait: "hanging-shoes",
    },
  }),
  Object.freeze({
    id: "kerala",
    slug: "kerala",
    title: "kerala",
    destination: "india",
    route: "/portfolio/kerala",
    available: true,
    coverPhotoIds: {
      landscape: "kochi-port-ocean-sky",
      portrait: "palm-tree-sunset",
    },
  }),
  Object.freeze({
    id: "nature",
    slug: "nature",
    title: "nature",
    route: "/portfolio/nature",
    available: true,
    coverPhotoIds: {
      landscape: "leaves-and-clouds-1",
      portrait: "leaves-and-clouds-1",
    },
  }),
] as const satisfies readonly PortfolioProjectSummary[]);

export function getPortfolioProject(slug: string) {
  return PORTFOLIO_PROJECTS.find(
    (project) =>
      project.slug === slug && project.route !== "/" && project.available,
  );
}
