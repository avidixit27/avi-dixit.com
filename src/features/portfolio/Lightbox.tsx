import { useCallback, useEffect, useRef, useState } from "react";
import ResponsiveImage from "../../components/ResponsiveImage";
import type { Photo } from "./photoCatalog";
import type { PhotoDirection } from "./photoNavigation";
import { getAdjacentPhotoIndex } from "./photoNavigation";

const CLOSE_DURATION_MS = 150;
const CLOSE_BUTTON_TOP_OFFSET_PX = 12;
const DEFAULT_CLOSE_BUTTON_TOP_PX = 24;
const LIGHTBOX_MAX_WIDTH_VIEWPORT_PERCENT = 95;
const LIGHTBOX_MAX_HEIGHT_VIEWPORT_PERCENT = 95;
const LIGHTBOX_IMAGE_SIZES = `${LIGHTBOX_MAX_WIDTH_VIEWPORT_PERCENT}vw`;

interface LightboxProps {
  photos: readonly Photo[];
  selectedIndex: number;
  previewSrc: string;
  landscapeIndices: readonly number[];
  onSelect: (index: number, previewSrc: string) => void;
  onClosed: () => void;
}

export default function Lightbox({
  photos,
  selectedIndex,
  previewSrc,
  landscapeIndices,
  onSelect,
  onClosed,
}: LightboxProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [loadedPhotoId, setLoadedPhotoId] = useState<string | null>(null);
  const [closeButtonTop, setCloseButtonTop] = useState(
    DEFAULT_CLOSE_BUTTON_TOP_PX,
  );

  const updateCloseButton = useCallback(() => {
    if (!imageRef.current) return;
    const imageRect = imageRef.current.getBoundingClientRect();
    setCloseButtonTop(imageRect.top - CLOSE_BUTTON_TOP_OFFSET_PX);
  }, []);

  const requestClose = useCallback(() => {
    if (closeTimerRef.current) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClosed();
    }, CLOSE_DURATION_MS);
  }, [onClosed]);

  const selectAdjacent = useCallback(
    (direction: PhotoDirection) => {
      const nextIndex = getAdjacentPhotoIndex(
        selectedIndex,
        landscapeIndices,
        direction,
      );
      const nextPhoto = nextIndex == null ? undefined : photos[nextIndex];
      if (nextIndex != null && nextPhoto) {
        setIsClosing(false);
        onSelect(nextIndex, nextPhoto.src);
      }
    },
    [landscapeIndices, onSelect, photos, selectedIndex],
  );

  useEffect(() => {
    const adjacentIndices = new Set(
      ([-1, 1] as const)
        .map((direction) =>
          getAdjacentPhotoIndex(selectedIndex, landscapeIndices, direction),
        )
        .filter((index): index is number => index != null),
    );
    adjacentIndices.forEach((index) => {
      const adjacentPhoto = photos[index];
      if (!adjacentPhoto) return;
      const preload = new Image();
      preload.decoding = "async";
      preload.src = adjacentPhoto.src;
    });
  }, [landscapeIndices, photos, selectedIndex]);

  useEffect(() => {
    updateCloseButton();
  }, [selectedIndex, updateCloseButton]);

  useEffect(() => {
    window.addEventListener("resize", updateCloseButton);
    return () => window.removeEventListener("resize", updateCloseButton);
  }, [updateCloseButton]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        selectAdjacent(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        selectAdjacent(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose, selectAdjacent]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  const photo = photos[selectedIndex];
  if (!photo) return null;
  const stageWidth = `min(${LIGHTBOX_MAX_WIDTH_VIEWPORT_PERCENT}vw, ${
    LIGHTBOX_MAX_HEIGHT_VIEWPORT_PERCENT * photo.aspectRatio
  }vh)`;

  return (
    <div
      className={`fixed inset-0 bg-black/95 z-[100] overflow-hidden flex items-center justify-center
                  transition-opacity ${isClosing ? "opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: `${CLOSE_DURATION_MS}ms` }}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        className="fixed inset-0 z-0 cursor-default"
        onClick={requestClose}
        aria-label="Close photo viewer"
      />
      <button
        type="button"
        onMouseDown={(event) => {
          event.stopPropagation();
          requestClose();
        }}
        onClick={(event) => {
          event.stopPropagation();
          requestClose();
        }}
        className="fixed right-8 z-[200] text-white text-4xl font-light
                   drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]
                   opacity-90 hover:opacity-100 hover:text-accentWarm
                   transition-colors transition-opacity"
        style={{ top: `${closeButtonTop}px` }}
        aria-label="Close"
      >
        ×
      </button>

      {landscapeIndices.length > 0 && (
        <>
          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              selectAdjacent(-1);
            }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-[200]
                       grid place-items-center w-12 h-12 md:w-14 md:h-14
                       rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Previous image"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="white"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              selectAdjacent(1);
            }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-[200]
                       grid place-items-center w-12 h-12 md:w-14 md:h-14
                       rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Next image"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="white"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      <div
        data-lightbox-stage="true"
        className="pointer-events-none relative z-10 grid"
        style={{
          width: stageWidth,
          aspectRatio: `${photo.width} / ${photo.height}`,
        }}
      >
        <img
          data-lightbox-preview="true"
          src={previewSrc}
          width={photo.width}
          height={photo.height}
          alt=""
          aria-hidden="true"
          draggable="false"
          className={`pointer-events-none col-start-1 row-start-1 w-full h-full object-contain rounded-lg shadow-2xl transition-opacity ${
            loadedPhotoId === photo.id ? "opacity-0" : "opacity-100"
          }`}
        />
        <ResponsiveImage
          key={photo.id}
          imageRef={imageRef}
          src={photo.src}
          srcSet={photo.srcSet}
          sources={photo.sources}
          sizes={LIGHTBOX_IMAGE_SIZES}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="eager"
          fetchPriority="high"
          pictureClassName="contents"
          className={`pointer-events-auto col-start-1 row-start-1 w-full h-full object-contain rounded-lg shadow-2xl transition-opacity ${
            loadedPhotoId === photo.id ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => {
            const loadedImage = imageRef.current;
            if (!loadedImage) return;
            const revealLoadedImage = () => {
              if (imageRef.current !== loadedImage) return;
              setLoadedPhotoId(photo.id);
              updateCloseButton();
            };
            if (typeof loadedImage.decode !== "function") {
              revealLoadedImage();
              return;
            }
            void loadedImage
              .decode()
              .catch(() => undefined)
              .then(revealLoadedImage);
          }}
        />
      </div>
    </div>
  );
}
