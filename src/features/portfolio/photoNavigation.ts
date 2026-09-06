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

export function getPhotoIndexByOffset(
  currentIndex: number,
  eligibleIndices: readonly number[],
  offset: number,
): number | null {
  if (offset === 0) {
    return eligibleIndices.includes(currentIndex) ? currentIndex : null;
  }

  const direction: PhotoDirection = offset > 0 ? 1 : -1;
  let nextIndex: number | null = currentIndex;
  for (let step = 0; step < Math.abs(offset); step += 1) {
    nextIndex = getAdjacentPhotoIndex(nextIndex, eligibleIndices, direction);
    if (nextIndex == null) return null;
  }
  return nextIndex;
}

export function getSurroundingPhotoIndices(
  currentIndex: number,
  eligibleIndices: readonly number[],
  forwardCount: number,
  backwardCount: number,
): readonly number[] {
  const surroundingIndices = new Set<number>();
  const addOffset = (offset: number) => {
    const index = getPhotoIndexByOffset(currentIndex, eligibleIndices, offset);
    if (index != null && index !== currentIndex) surroundingIndices.add(index);
  };

  for (let offset = 1; offset <= forwardCount; offset += 1) addOffset(offset);
  for (let offset = 1; offset <= backwardCount; offset += 1) addOffset(-offset);
  return [...surroundingIndices];
}
