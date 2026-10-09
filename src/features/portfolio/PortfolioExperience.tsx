import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode, Ref } from "react";
import HeroSlideshow from "./HeroSlideshow";
import type { HeroPhotoIdsByOrientation } from "./HeroSlideshow";
import Lightbox from "./Lightbox";
import type { Photo } from "./photoTypes";
import { HERO_PHOTO_COUNT } from "./portfolioPresentationPolicy";
import PhotoGrid from "./PhotoGrid";

interface PhotoSelection {
  readonly index: number;
  readonly previewSrc: string;
}

interface PortfolioExperienceProps {
  photos: readonly Photo[];
  heroResetKey?: string;
  initialHeroPhotoIdsByOrientation?: HeroPhotoIdsByOrientation | undefined;
  showPhotoNumber?: boolean;
  gridMarkerRef?: Ref<HTMLDivElement>;
  children?: (onOpen: (index: number, previewSrc: string) => void) => ReactNode;
  afterGrid?: (
    onOpen: (index: number, previewSrc: string) => void,
  ) => ReactNode;
}

export default function PortfolioExperience({
  photos,
  heroResetKey,
  initialHeroPhotoIdsByOrientation,
  showPhotoNumber = false,
  gridMarkerRef,
  children,
  afterGrid,
}: PortfolioExperienceProps) {
  const [selection, setSelection] = useState<PhotoSelection | null>(null);
  const isLightboxOpen = selection != null;
  const heroPhotos = useMemo(() => photos.slice(0, HERO_PHOTO_COUNT), [photos]);
  const navigationIndices = useMemo(
    () => photos.map((_, index) => index),
    [photos],
  );

  const selectPhoto = useCallback((index: number, previewSrc: string) => {
    setSelection({ index, previewSrc });
  }, []);
  const closeLightbox = useCallback(() => setSelection(null), []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    document.documentElement.classList.add("modal-open");
    return () => document.documentElement.classList.remove("modal-open");
  }, [isLightboxOpen]);

  return (
    <div className="min-h-screen bg-canvas">
      <HeroSlideshow
        key={heroResetKey}
        photos={heroPhotos}
        initialPhotoIdsByOrientation={initialHeroPhotoIdsByOrientation}
        onOpen={selectPhoto}
      />
      {children?.(selectPhoto)}
      <PhotoGrid
        photos={photos}
        {...(gridMarkerRef ? { gridMarkerRef } : {})}
        onOpen={selectPhoto}
      />
      {afterGrid?.(selectPhoto)}
      {selection && (
        <Lightbox
          photos={photos}
          selectedIndex={selection.index}
          previewSrc={selection.previewSrc}
          navigationIndices={navigationIndices}
          showPhotoNumber={showPhotoNumber}
          onSelect={selectPhoto}
          onClosed={closeLightbox}
        />
      )}
    </div>
  );
}
