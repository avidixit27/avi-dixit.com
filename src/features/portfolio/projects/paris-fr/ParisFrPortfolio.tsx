import type { Ref } from "react";
import ProjectPortfolio from "../ProjectPortfolio";
import { getPortfolioProject } from "../portfolioProjects";
import { PARIS_FR_PHOTO_CATALOG } from "./photoCatalog";

export default function ParisFrPortfolio({
  gridMarkerRef,
}: {
  gridMarkerRef: Ref<HTMLDivElement>;
}) {
  const project = getPortfolioProject("paris-fr");
  if (!project) throw new Error("Missing Paris project summary");

  return (
    <ProjectPortfolio
      project={project}
      photos={PARIS_FR_PHOTO_CATALOG}
      gridMarkerRef={gridMarkerRef}
    />
  );
}
