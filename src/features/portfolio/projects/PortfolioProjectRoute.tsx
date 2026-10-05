import { lazy } from "react";
import type { Ref } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../../../app/NotFound";

const ParisFrPortfolio = lazy(() => import("./paris-fr/ParisFrPortfolio"));
const KeralaPortfolio = lazy(() => import("./kerala/KeralaPortfolio"));

export default function PortfolioProjectRoute({
  gridMarkerRef,
}: {
  gridMarkerRef: Ref<HTMLDivElement>;
}) {
  const { slug } = useParams();
  const Project =
    slug === "paris-fr"
      ? ParisFrPortfolio
      : slug === "kerala"
        ? KeralaPortfolio
        : null;

  if (!Project) return <NotFound />;

  return <Project gridMarkerRef={gridMarkerRef} />;
}
