import { useCallback, useEffect, useState } from "react";
import HeroSlideshow from "./HeroSlideshow";
import Lightbox from "./Lightbox";
import { PHOTO_CATALOG } from "./photoCatalog";
import PhotoGrid from "./PhotoGrid";
import useLandscapePhotoIndices from "./useLandscapePhotoIndices";

const HERO_PHOTO_COUNT = 8;
const HERO_PHOTOS = Object.freeze(PHOTO_CATALOG.slice(0, HERO_PHOTO_COUNT));

export default function Portfolio({ gridMarkerRef }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const landscapeIndices = useLandscapePhotoIndices(PHOTO_CATALOG);
  const isLightboxOpen = selectedIndex != null;

  const openLightbox = useCallback((index) => {
    setSelectedIndex(index);
  }, []);
  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    document.documentElement.classList.add("modal-open");
    return () => document.documentElement.classList.remove("modal-open");
  }, [isLightboxOpen]);

  return (
    <div className="bg-primary min-h-screen">
      <HeroSlideshow photos={HERO_PHOTOS} onOpen={openLightbox} />
      <PhotoGrid
        photos={PHOTO_CATALOG}
        gridMarkerRef={gridMarkerRef}
        onOpen={openLightbox}
      />
      {isLightboxOpen && (
        <Lightbox
          photos={PHOTO_CATALOG}
          selectedIndex={selectedIndex}
          landscapeIndices={landscapeIndices}
          onSelect={setSelectedIndex}
          onClosed={closeLightbox}
        />
      )}
    </div>
  );
}
