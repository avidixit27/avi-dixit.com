import type { Ref } from "react";
import BlurImage from "../../components/BlurImage";
import type { Photo } from "./photoCatalog";

interface PhotoGridProps {
  photos: readonly Photo[];
  gridMarkerRef: Ref<HTMLDivElement>;
  onOpen: (index: number) => void;
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
            <div
              key={photo.id}
              className="relative rounded-xl bg-white/5 p-3 transform-gpu transition-transform duration-200 will-change-transform contain-paint
                         cursor-pointer hover:scale-[1.015] shadow-md hover:shadow-lg"
              onClick={() => onOpen(index)}
            >
              <BlurImage
                src={photo.src}
                alt={photo.alt}
                className="w-full h-auto rounded-lg"
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
