import { useEffect, useState } from "react";
import type { Photo } from "./photoCatalog";

const LANDSCAPE_ASPECT_RATIO = 1.2;
let cachedPhotos: readonly Photo[] | undefined;
let cachedLandscapeIndicesPromise: Promise<readonly number[]> | undefined;

function loadLandscapePhotoIndices(
  photos: readonly Photo[],
): Promise<readonly number[]> {
  if (cachedPhotos === photos && cachedLandscapeIndicesPromise) {
    return cachedLandscapeIndicesPromise;
  }

  cachedPhotos = photos;
  cachedLandscapeIndicesPromise = (async () => {
    const indices = [];
    for (let index = 0; index < photos.length; index += 1) {
      const photo = photos[index];
      if (!photo) continue;
      const image = new Image();
      image.src = photo.src;
      await image.decode().catch(() => undefined);
      if (image.width > image.height * LANDSCAPE_ASPECT_RATIO) {
        indices.push(index);
      }
    }
    return indices;
  })();

  return cachedLandscapeIndicesPromise;
}

export default function useLandscapePhotoIndices(
  photos: readonly Photo[],
): readonly number[] {
  const [landscapeIndices, setLandscapeIndices] = useState<readonly number[]>(
    [],
  );

  useEffect(() => {
    if (photos.length === 0) {
      setLandscapeIndices([]);
      return undefined;
    }

    let isCancelled = false;
    loadLandscapePhotoIndices(photos).then((indices) => {
      if (!isCancelled) setLandscapeIndices(indices);
    });
    return () => {
      isCancelled = true;
    };
  }, [photos]);

  return landscapeIndices;
}
