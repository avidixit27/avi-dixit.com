export type PhotoDirection = -1 | 1;

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
