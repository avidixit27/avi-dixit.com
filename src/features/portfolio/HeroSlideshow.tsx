import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResponsiveImage from "../../components/ResponsiveImage";
import type { Photo } from "./photoCatalog";
import { getHeroPhotoIndices } from "./heroOrientation";
import {
  HERO_CROSSFADE_DURATION_MS,
  HERO_IMAGE_SIZES,
  HERO_ROTATION_DELAY_MS,
} from "./portfolioPresentationPolicy";

interface SlideshowState {
  readonly activeIndex: number;
  readonly outgoingIndex: number | null;
  readonly resetKey: string | undefined;
}

export interface HeroPhotoIdsByOrientation {
  readonly landscape: string;
  readonly portrait: string;
}

interface HeroSlideshowProps {
  photos: readonly Photo[];
  resetKey?: string | undefined;
  initialPhotoIdsByOrientation?: HeroPhotoIdsByOrientation | undefined;
  onOpen: (index: number, previewSrc: string) => void;
}

export default function HeroSlideshow({
  photos,
  resetKey,
  initialPhotoIdsByOrientation,
  onOpen,
}: HeroSlideshowProps) {
  const [isLandscapeViewport, setIsLandscapeViewport] = useState(
    () => window.matchMedia("(orientation: landscape)").matches,
  );
  const heroPhotoIndices = useMemo(
    () =>
      getHeroPhotoIndices(
        photos,
        isLandscapeViewport,
        initialPhotoIdsByOrientation?.[
          isLandscapeViewport ? "landscape" : "portrait"
        ],
      ),
    [initialPhotoIdsByOrientation, isLandscapeViewport, photos],
  );
  const [slideshow, setSlideshow] = useState<SlideshowState>({
    activeIndex: 0,
    outgoingIndex: null,
    resetKey,
  });
  if (slideshow.resetKey !== resetKey) {
    setSlideshow({ activeIndex: 0, outgoingIndex: null, resetKey });
  }
  const activeImageRef = useRef<HTMLImageElement>(null);
  const loadedPhotoIdsRef = useRef(new Set<string>());

  const markPhotoLoaded = useCallback((photoId: string) => {
    loadedPhotoIdsRef.current.add(photoId);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: landscape)");
    const updateOrientation = () => {
      setIsLandscapeViewport(mediaQuery.matches);
      setSlideshow((current) => ({
        ...current,
        activeIndex: 0,
        outgoingIndex: null,
      }));
    };
    mediaQuery.addEventListener("change", updateOrientation);
    return () => mediaQuery.removeEventListener("change", updateOrientation);
  }, []);

  useEffect(() => {
    if (heroPhotoIndices.length === 0) return undefined;
    const interval = setInterval(() => {
      setSlideshow((current) => {
        const nextIndex = (current.activeIndex + 1) % heroPhotoIndices.length;
        const nextPhotoIndex = heroPhotoIndices[nextIndex];
        const nextPhoto =
          nextPhotoIndex == null ? undefined : photos[nextPhotoIndex];
        return nextPhoto && loadedPhotoIdsRef.current.has(nextPhoto.id)
          ? {
              ...current,
              activeIndex: nextIndex,
              outgoingIndex: current.activeIndex,
            }
          : current;
      });
    }, HERO_ROTATION_DELAY_MS);
    return () => clearInterval(interval);
  }, [heroPhotoIndices, photos, resetKey]);

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

  if (heroPhotoIndices.length === 0) return null;

  const activeIndex = slideshow.activeIndex;
  const activePhotoIndex = heroPhotoIndices[activeIndex];
  const activePhoto =
    activePhotoIndex == null ? undefined : photos[activePhotoIndex];
  if (activePhotoIndex == null || !activePhoto) return null;
  const nextIndex = (activeIndex + 1) % heroPhotoIndices.length;
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
          activePhotoIndex,
          activeImageRef.current?.currentSrc || activePhoto.src,
        )
      }
      aria-label="Open hero image gallery"
    >
      {visibleIndices.map((index) => {
        const photoIndex = heroPhotoIndices[index];
        const photo = photoIndex == null ? undefined : photos[photoIndex];
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
            showSkeleton={isActive}
            pictureClassName="absolute inset-0 block overflow-hidden"
            onLoad={() => markPhotoLoaded(photo.id)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: `${HERO_CROSSFADE_DURATION_MS}ms` }}
          />
        );
      })}
    </button>
  );
}
