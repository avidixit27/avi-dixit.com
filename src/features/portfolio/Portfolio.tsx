import { useCallback, useEffect, useState } from "react";
import type { Ref } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArtistStatement from "./ArtistStatement";
import HeroSlideshow from "./HeroSlideshow";
import Lightbox from "./Lightbox";
import { PHOTO_CATALOG } from "./photoCatalog";
import { HERO_PHOTO_COUNT } from "./portfolioPresentationPolicy";
import PhotoGrid from "./PhotoGrid";
import PortfolioScrollComposition from "./PortfolioScrollComposition";
import { ROUTES } from "../../resources/navigation";

const HERO_PHOTOS = Object.freeze(PHOTO_CATALOG.slice(0, HERO_PHOTO_COUNT));
const PHOTO_INDICES = Object.freeze(PHOTO_CATALOG.map((_, index) => index));

interface PortfolioProps {
  gridMarkerRef: Ref<HTMLDivElement>;
}

interface PhotoSelection {
  readonly index: number;
  readonly previewSrc: string;
}

export default function Portfolio({ gridMarkerRef }: PortfolioProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selection, setSelection] = useState<PhotoSelection | null>(null);
  const isLightboxOpen = selection != null;
  const isArtistStatementOpen = location.hash === "#artist-statement";

  const selectPhoto = useCallback((index: number, previewSrc: string) => {
    setSelection({ index, previewSrc });
  }, []);
  const closeLightbox = useCallback(() => {
    setSelection(null);
  }, []);
  const closeArtistStatement = useCallback(() => {
    navigate(
      { pathname: ROUTES.home, hash: "" },
      { replace: true, state: "restore-artist-statement-focus" },
    );
  }, [navigate]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    document.documentElement.classList.add("modal-open");
    return () => document.documentElement.classList.remove("modal-open");
  }, [isLightboxOpen]);

  return (
    <div className="min-h-screen bg-canvas">
      <HeroSlideshow photos={HERO_PHOTOS} onOpen={selectPhoto} />
      <PortfolioScrollComposition photos={PHOTO_CATALOG} onOpen={selectPhoto} />
      <PhotoGrid
        photos={PHOTO_CATALOG}
        gridMarkerRef={gridMarkerRef}
        onOpen={selectPhoto}
      />
      <ArtistStatement
        isOpen={isArtistStatementOpen}
        onClose={closeArtistStatement}
      />
      {selection && (
        <Lightbox
          photos={PHOTO_CATALOG}
          selectedIndex={selection.index}
          previewSrc={selection.previewSrc}
          navigationIndices={PHOTO_INDICES}
          onSelect={selectPhoto}
          onClosed={closeLightbox}
        />
      )}
    </div>
  );
}
