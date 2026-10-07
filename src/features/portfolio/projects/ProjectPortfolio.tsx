import PortfolioExperience from "../PortfolioExperience";
import type { Ref } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

  return (
    <PortfolioExperience
      photos={photos}
      heroResetKey={location.key}
      gridMarkerRef={gridMarkerRef}
    >
      {() => (
        <section
          data-project-title-panel="true"
          className="flex h-footer items-center overflow-hidden border-t-8 border-canvas bg-brand-vivid text-canvas"
        >
          <div className="page-container w-full">
            <h1
              data-project-title="true"
              className="translate-y-[0.05em] text-center font-photo-number text-[clamp(3rem,min(18vw,26vh),18rem)] leading-none uppercase"
            >
              {project.title}
            </h1>
          </div>
        </section>
      )}
    </PortfolioExperience>
  );
}
