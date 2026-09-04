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
      <main className="max-w-7xl mx-auto px-8 pt-12">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.map((photo, index) => (
            <button
              type="button"
              key={photo.id}
              className="relative block w-full rounded-xl bg-white/5 p-3 transform-gpu transition-transform duration-200 will-change-transform contain-paint
                         cursor-pointer hover:scale-[1.015] shadow-md hover:shadow-lg"
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
                className="w-full h-auto rounded-lg"
              />
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
