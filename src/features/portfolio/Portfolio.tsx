import { useCallback } from "react";
import type { Ref } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArtistStatement from "./ArtistStatement";
import PortfolioExperience from "./PortfolioExperience";
import PortfolioScrollComposition from "./PortfolioScrollComposition";
import { FILM_PHOTO_CATALOG } from "./projects/film/photoCatalog";
import { ROUTES } from "../../resources/navigation";

interface PortfolioProps {
  gridMarkerRef: Ref<HTMLDivElement>;
}

export default function Portfolio({ gridMarkerRef }: PortfolioProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isArtistStatementOpen = location.hash === "#artist-statement";

  const closeArtistStatement = useCallback(() => {
    navigate(
      { pathname: ROUTES.home, hash: "" },
      { replace: true, state: "restore-artist-statement-focus" },
    );
  }, [navigate]);

  return (
    <PortfolioExperience
      photos={FILM_PHOTO_CATALOG}
      showPhotoNumber
      gridMarkerRef={gridMarkerRef}
      afterGrid={() => (
        <ArtistStatement
          isOpen={isArtistStatementOpen}
          onClose={closeArtistStatement}
        />
      )}
    >
      {(onOpen) => (
        <PortfolioScrollComposition
          photos={FILM_PHOTO_CATALOG}
          onOpen={onOpen}
        />
      )}
    </PortfolioExperience>
  );
}
