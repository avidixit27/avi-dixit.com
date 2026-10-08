import { lazy } from "react";
import type { Ref } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../../../app/NotFound";
import { PORTFOLIO_PROJECT_MODULE_LOADERS } from "./portfolioProjectModules";

const PROJECT_COMPONENTS = {
  "paris-fr": lazy(PORTFOLIO_PROJECT_MODULE_LOADERS["paris-fr"]),
  kerala: lazy(PORTFOLIO_PROJECT_MODULE_LOADERS.kerala),
  nature: lazy(PORTFOLIO_PROJECT_MODULE_LOADERS.nature),
} as const;

export default function PortfolioProjectRoute({
  gridMarkerRef,
}: {
  gridMarkerRef: Ref<HTMLDivElement>;
}) {
  const { slug } = useParams();
  const Project =
    slug && Object.hasOwn(PROJECT_COMPONENTS, slug)
      ? PROJECT_COMPONENTS[slug as keyof typeof PROJECT_COMPONENTS]
      : undefined;

  if (!Project) return <NotFound />;

  return <Project gridMarkerRef={gridMarkerRef} />;
}
