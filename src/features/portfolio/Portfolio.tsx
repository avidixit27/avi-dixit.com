import { useCallback, useEffect, useState } from "react";
import type { Ref } from "react";
import HeroSlideshow from "./HeroSlideshow";
import Lightbox from "./Lightbox";
import { PHOTO_CATALOG } from "./photoCatalog";
import { getLandscapePhotoIndices } from "./photoNavigation";
import PhotoGrid from "./PhotoGrid";

const HERO_PHOTO_COUNT = 8;
const HERO_PHOTOS = Object.freeze(PHOTO_CATALOG.slice(0, HERO_PHOTO_COUNT));
const LANDSCAPE_PHOTO_INDICES = Object.freeze(
  getLandscapePhotoIndices(PHOTO_CATALOG),
);

interface PortfolioProps {
  gridMarkerRef: Ref<HTMLDivElement>;
}

interface PhotoSelection {
  readonly index: number;
  readonly previewSrc: string;
}

export default function Portfolio({ gridMarkerRef }: PortfolioProps) {
  const [selection, setSelection] = useState<PhotoSelection | null>(null);
  const isLightboxOpen = selection != null;

  const selectPhoto = useCallback((index: number, previewSrc: string) => {
    setSelection({ index, previewSrc });
  }, []);
  const closeLightbox = useCallback(() => {
    setSelection(null);
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    document.documentElement.classList.add("modal-open");
    return () => document.documentElement.classList.remove("modal-open");
  }, [isLightboxOpen]);

  return (
    <div className="bg-primary min-h-screen">
      <HeroSlideshow photos={HERO_PHOTOS} onOpen={selectPhoto} />
      <PhotoGrid
        photos={PHOTO_CATALOG}
        gridMarkerRef={gridMarkerRef}
        onOpen={selectPhoto}
      />
      {selection && (
        <Lightbox
          photos={PHOTO_CATALOG}
          selectedIndex={selection.index}
          previewSrc={selection.previewSrc}
          landscapeIndices={LANDSCAPE_PHOTO_INDICES}
          onSelect={selectPhoto}
          onClosed={closeLightbox}
        />
      )}
    </div>
  );
}
