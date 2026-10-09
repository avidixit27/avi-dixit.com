interface SizedPhoto {
  readonly id: string;
  readonly width: number;
  readonly height: number;
}

export function getHeroPhotoIndices(
  photos: readonly SizedPhoto[],
  isLandscapeViewport: boolean,
  preferredPhotoId?: string,
): readonly number[] {
  const matchingIndices = photos.flatMap((photo, index) =>
    photo.width >= photo.height === isLandscapeViewport ? [index] : [],
  );
  const indices =
    matchingIndices.length > 0
      ? matchingIndices
      : photos.map((_, index) => index);
  const preferredIndex = photos.findIndex(
    (photo) => photo.id === preferredPhotoId,
  );

  return preferredIndex < 0
    ? indices
    : [preferredIndex, ...indices.filter((index) => index !== preferredIndex)];
}
