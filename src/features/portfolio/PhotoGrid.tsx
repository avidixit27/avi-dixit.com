import { useState } from "react";
import type { Ref } from "react";
import ResponsiveImage from "../../components/ResponsiveImage";
import type { Photo } from "./photoCatalog";
import { LIGHTBOX_IMAGE_SIZES } from "./portfolioPresentationPolicy";

const GRID_IMAGE_SIZES =
  "(min-width: 1024px) calc((100vw - 8rem) / 3), (min-width: 768px) calc((100vw - 6rem) / 2), calc(100vw - 4rem)";

interface PhotoGridProps {
  photos: readonly Photo[];
  gridMarkerRef?: Ref<HTMLDivElement>;
  onOpen: (index: number, previewSrc: string) => void;
}

export default function PhotoGrid({
  photos,
  gridMarkerRef,
  onOpen,
}: PhotoGridProps) {
  const [preloadPhotoId, setPreloadPhotoId] = useState<string>();

  return (
    <>
      <div ref={gridMarkerRef} className="h-0 w-full" />
      <main
        data-photo-grid="true"
        className="page-container relative z-10 bg-canvas py-16 sm:py-20"
      >
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {photos.map((photo, index) => (
            <button
              type="button"
              key={photo.id}
              className={`relative block w-full cursor-pointer rounded-panel border border-border bg-surface p-2 shadow-panel
                         transition-[transform,border-color] duration-200 hover:scale-[1.01] hover:border-border-strong sm:p-3 ${
                           photo.height > photo.width ? "md:row-span-2" : ""
                         }`}
              onPointerEnter={() => setPreloadPhotoId(photo.id)}
              onFocus={() => setPreloadPhotoId(photo.id)}
              onClick={(event) =>
                onOpen(
                  index,
                  event.currentTarget.querySelector("img")?.currentSrc ||
                    photo.src,
                )
              }
              aria-label={`Open ${photo.alt}`}
            >
              <ResponsiveImage
                src={photo.src}
                srcSet={photo.srcSet}
                sources={photo.sources}
                sizes={
                  preloadPhotoId === photo.id
                    ? LIGHTBOX_IMAGE_SIZES
                    : GRID_IMAGE_SIZES
                }
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading="lazy"
                fetchPriority={preloadPhotoId === photo.id ? "high" : "low"}
                className="h-auto w-full rounded-control"
              />
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
