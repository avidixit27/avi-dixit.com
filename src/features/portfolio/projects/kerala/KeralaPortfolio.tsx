import type { Ref } from "react";
import ProjectPortfolio from "../ProjectPortfolio";
import { getPortfolioProject } from "../portfolioProjects";
import { KERALA_PHOTO_CATALOG } from "./photoCatalog";

export default function KeralaPortfolio({
  gridMarkerRef,
}: {
  gridMarkerRef: Ref<HTMLDivElement>;
}) {
  const project = getPortfolioProject("kerala");
  if (!project) throw new Error("Missing Kerala project summary");

  return (
    <ProjectPortfolio
      project={project}
      photos={KERALA_PHOTO_CATALOG}
      gridMarkerRef={gridMarkerRef}
    />
  );
}
