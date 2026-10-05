import PortfolioExperience from "../PortfolioExperience";
import type { Ref } from "react";
import type { Photo } from "../photoTypes";
import type { PortfolioProjectSummary } from "./portfolioProjects";

interface ProjectPortfolioProps {
  project: PortfolioProjectSummary;
  photos: readonly Photo[];
  gridMarkerRef: Ref<HTMLDivElement>;
}

export default function ProjectPortfolio({
  project,
  photos,
  gridMarkerRef,
}: ProjectPortfolioProps) {
  return (
    <PortfolioExperience photos={photos} gridMarkerRef={gridMarkerRef}>
      {() => (
        <header className="page-container py-16 sm:py-20">
          <p className="font-inter text-sm tracking-[0.18em] text-text-muted">
            {project.destination}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.625rem,10vw,4.5rem)] leading-none text-text">
            {project.title}
          </h1>
        </header>
      )}
    </PortfolioExperience>
  );
}
