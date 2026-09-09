import type { Ref } from "react";
import ResponsiveImage from "../../components/ResponsiveImage";
import type { Photo } from "./photoCatalog";

const GRID_IMAGE_SIZES =
  "(min-width: 1024px) calc((100vw - 8rem) / 3), (min-width: 768px) calc((100vw - 6rem) / 2), calc(100vw - 4rem)";

interface PhotoGridProps {
  photos: readonly Photo[];
  gridMarkerRef: Ref<HTMLDivElement>;
  onOpen: (index: number, previewSrc: string) => void;
}

export default function PhotoGrid({
  photos,
  gridMarkerRef,
  onOpen,
}: PhotoGridProps) {
  return (
    <>
      <div ref={gridMarkerRef} className="h-0 w-full" />
      <main className="page-container py-16 sm:py-20">
        <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 lg:gap-8 lg:space-y-8">
          {photos.map((photo, index) => (
            <button
              type="button"
              key={photo.id}
              className="relative block w-full cursor-pointer rounded-panel border border-border bg-surface p-2 shadow-panel
                         transition-[transform,border-color] duration-200 hover:scale-[1.01] hover:border-border-strong sm:p-3"
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
                sizes={GRID_IMAGE_SIZES}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading="lazy"
                fetchPriority="low"
                className="h-auto w-full rounded-control"
              />
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
