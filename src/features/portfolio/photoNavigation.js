export function getAdjacentPhotoIndex(
  currentIndex,
  eligibleIndices,
  direction,
) {
  if (currentIndex == null || eligibleIndices.length === 0) return null;

  const currentPosition = eligibleIndices.indexOf(currentIndex);
  if (currentPosition !== -1) {
    const nextPosition =
      (currentPosition + direction + eligibleIndices.length) %
      eligibleIndices.length;
    return eligibleIndices[nextPosition];
  }

  if (direction < 0) {
    return (
      eligibleIndices.filter((index) => index < currentIndex).at(-1) ??
      eligibleIndices.at(-1)
    );
  }

  return (
    eligibleIndices.find((index) => index > currentIndex) ?? eligibleIndices[0]
  );
}
