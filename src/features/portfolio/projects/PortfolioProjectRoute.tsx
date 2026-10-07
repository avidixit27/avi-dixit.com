import { lazy } from "react";
import type { Ref } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../../../app/NotFound";

const ParisFrPortfolio = lazy(() => import("./paris-fr/ParisFrPortfolio"));
const KeralaPortfolio = lazy(() => import("./kerala/KeralaPortfolio"));
const NaturePortfolio = lazy(() => import("./nature/NaturePortfolio"));

const PROJECT_COMPONENTS = {
  "paris-fr": ParisFrPortfolio,
  kerala: KeralaPortfolio,
  nature: NaturePortfolio,
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
