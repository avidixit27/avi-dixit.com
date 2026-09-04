export type PhotoDirection = -1 | 1;

const LANDSCAPE_ASPECT_RATIO = 1.2;

interface IntrinsicImageSize {
  readonly width: number;
  readonly height: number;
}

export function getLandscapePhotoIndices(
  photos: readonly IntrinsicImageSize[],
): readonly number[] {
  return photos.flatMap((photo, index) =>
    photo.width > photo.height * LANDSCAPE_ASPECT_RATIO ? [index] : [],
  );
}

export function getAdjacentPhotoIndex(
  currentIndex: number | null,
  eligibleIndices: readonly number[],
  direction: PhotoDirection,
): number | null {
  if (currentIndex == null || eligibleIndices.length === 0) return null;

  const currentPosition = eligibleIndices.indexOf(currentIndex);
  if (currentPosition !== -1) {
    const nextPosition =
      (currentPosition + direction + eligibleIndices.length) %
      eligibleIndices.length;
    return eligibleIndices[nextPosition] ?? null;
  }

  if (direction < 0) {
    return (
      eligibleIndices.filter((index) => index < currentIndex).at(-1) ??
      eligibleIndices.at(-1) ??
      null
    );
  }

  return (
    eligibleIndices.find((index) => index > currentIndex) ??
    eligibleIndices[0] ??
    null
  );
}
