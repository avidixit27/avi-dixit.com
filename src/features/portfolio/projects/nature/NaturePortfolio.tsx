import type { Ref } from "react";
import ProjectPortfolio from "../ProjectPortfolio";
import { getPortfolioProject } from "../portfolioProjects";
import { NATURE_PHOTO_CATALOG } from "./photoCatalog";

export default function NaturePortfolio({
  gridMarkerRef,
}: {
  gridMarkerRef: Ref<HTMLDivElement>;
}) {
  const project = getPortfolioProject("nature");
  if (!project) throw new Error("Missing Nature project summary");

  return (
    <ProjectPortfolio
      project={project}
      photos={NATURE_PHOTO_CATALOG}
      gridMarkerRef={gridMarkerRef}
    />
  );
}
