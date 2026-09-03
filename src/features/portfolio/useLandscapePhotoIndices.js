import { useEffect, useState } from "react";

const LANDSCAPE_ASPECT_RATIO = 1.2;
let cachedPhotos;
let cachedLandscapeIndicesPromise;

function loadLandscapePhotoIndices(photos) {
  if (cachedPhotos === photos && cachedLandscapeIndicesPromise) {
    return cachedLandscapeIndicesPromise;
  }

  cachedPhotos = photos;
  cachedLandscapeIndicesPromise = (async () => {
    const indices = [];
    for (let index = 0; index < photos.length; index += 1) {
      const image = new Image();
      image.src = photos[index].src;
      await image.decode().catch(() => undefined);
      if (image.width > image.height * LANDSCAPE_ASPECT_RATIO) {
        indices.push(index);
      }
    }
    return indices;
  })();

  return cachedLandscapeIndicesPromise;
}

export default function useLandscapePhotoIndices(photos) {
  const [landscapeIndices, setLandscapeIndices] = useState([]);

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
