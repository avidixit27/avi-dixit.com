interface SizedPhoto {
  readonly width: number;
  readonly height: number;
}

export function getHeroPhotoIndices(
  photos: readonly SizedPhoto[],
  isLandscapeViewport: boolean,
): readonly number[] {
  const matchingIndices = photos.flatMap((photo, index) =>
    photo.width >= photo.height === isLandscapeViewport ? [index] : [],
  );

  return matchingIndices.length > 0
    ? matchingIndices
    : photos.map((_, index) => index);
}
