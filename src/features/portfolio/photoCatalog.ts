import type { Photo, PhotoDetails } from "./photoTypes";

export type { Photo, PhotoDetails } from "./photoTypes";

function getGeneratedSource(
  modules: Readonly<Record<string, string>>,
  path: string,
): string {
  const source = modules[path];
  if (!source) throw new Error(`Missing generated media for ${path}`);
  return source;
}

export function buildPhotoFromModules(
  details: PhotoDetails,
  path: string,
  src: string,
  jpegSources: Readonly<Record<string, string>>,
  avifSources: Readonly<Record<string, string>>,
  webpSources: Readonly<Record<string, string>>,
): Photo {
  return Object.freeze({
    ...details,
    src,
    srcSet: getGeneratedSource(jpegSources, path),
    sources: Object.freeze([
      Object.freeze({
        type: "image/avif",
        srcSet: getGeneratedSource(avifSources, path),
      }),
      Object.freeze({
        type: "image/webp",
        srcSet: getGeneratedSource(webpSources, path),
      }),
    ]),
    aspectRatio: details.width / details.height,
  });
}

export function buildPhotoCatalog(
  detailsByFileName: Readonly<Record<string, PhotoDetails>>,
  fallbackSources: Readonly<Record<string, string>>,
  jpegSources: Readonly<Record<string, string>>,
  avifSources: Readonly<Record<string, string>>,
  webpSources: Readonly<Record<string, string>>,
): readonly Photo[] {
  const photos = Object.entries(fallbackSources).map(([path, src]) => {
    const fileName = path.split("/").at(-1);
    const details = fileName ? detailsByFileName[fileName] : undefined;
    if (!details) throw new Error(`Missing photo metadata for ${path}`);

    return buildPhotoFromModules(
      details,
      path,
      src,
      jpegSources,
      avifSources,
      webpSources,
    );
  });

  const ids = new Set(photos.map((photo) => photo.id));
  const sequences = new Set(photos.map((photo) => photo.sequence));
  if (ids.size !== photos.length || sequences.size !== photos.length) {
    throw new Error("Photo IDs and sequences must be unique");
  }

  return Object.freeze(
    photos.sort((first, second) => first.sequence - second.sequence),
  );
}
