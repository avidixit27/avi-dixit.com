import { useCallback, useEffect, useRef, useState } from "react";
import ResponsiveImage from "../../components/ResponsiveImage";
import type { Photo } from "./photoCatalog";

const HERO_ROTATION_DELAY_MS = 5000;
const HERO_CROSSFADE_DURATION_MS = 700;
const HERO_IMAGE_SIZES = "100vw";

interface SlideshowState {
  readonly activeIndex: number;
  readonly outgoingIndex: number | null;
}

interface HeroSlideshowProps {
  photos: readonly Photo[];
  onOpen: (index: number, previewSrc: string) => void;
}

export default function HeroSlideshow({ photos, onOpen }: HeroSlideshowProps) {
  const [slideshow, setSlideshow] = useState<SlideshowState>({
    activeIndex: 0,
    outgoingIndex: null,
  });
  const activeImageRef = useRef<HTMLImageElement>(null);
  const loadedPhotoIdsRef = useRef(new Set<string>());

  const markPhotoLoaded = useCallback((photoId: string) => {
    loadedPhotoIdsRef.current.add(photoId);
  }, []);

  useEffect(() => {
    if (photos.length === 0) return undefined;
    const interval = setInterval(() => {
      setSlideshow((current) => {
        const nextIndex = (current.activeIndex + 1) % photos.length;
        const nextPhoto = photos[nextIndex];
        return nextPhoto && loadedPhotoIdsRef.current.has(nextPhoto.id)
          ? {
              activeIndex: nextIndex,
              outgoingIndex: current.activeIndex,
            }
          : current;
      });
    }, HERO_ROTATION_DELAY_MS);
    return () => clearInterval(interval);
  }, [photos]);

  useEffect(() => {
    if (slideshow.outgoingIndex == null) return undefined;
    const outgoingIndex = slideshow.outgoingIndex;
    const timeout = window.setTimeout(() => {
      setSlideshow((current) =>
        current.outgoingIndex === outgoingIndex
          ? { ...current, outgoingIndex: null }
          : current,
      );
    }, HERO_CROSSFADE_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [slideshow.outgoingIndex]);

  if (photos.length === 0) return null;

  const activeIndex = slideshow.activeIndex;
  const activePhoto = photos[activeIndex];
  if (!activePhoto) return null;
  const nextIndex = (activeIndex + 1) % photos.length;
  const visibleIndices = Array.from(
    new Set(
      [slideshow.outgoingIndex, activeIndex, nextIndex].filter(
        (index): index is number => index != null,
      ),
    ),
  );

  return (
    <button
      type="button"
      className="relative block h-[100svh] w-full cursor-pointer"
      onClick={() =>
        onOpen(
          activeIndex,
          activeImageRef.current?.currentSrc || activePhoto.src,
        )
      }
      aria-label="Open hero image gallery"
    >
      {visibleIndices.map((index) => {
        const photo = photos[index];
        if (!photo) return null;
        const isActive = index === activeIndex;
        const isInitialHero = isActive && index === 0;
        return (
          <ResponsiveImage
            key={photo.id}
            src={photo.src}
            srcSet={photo.srcSet}
            sources={photo.sources}
            sizes={HERO_IMAGE_SIZES}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            loading="eager"
            fetchPriority={isInitialHero ? "high" : "low"}
            imageRef={isActive ? activeImageRef : null}
            onLoad={() => markPhotoLoaded(photo.id)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}
    </button>
  );
}
