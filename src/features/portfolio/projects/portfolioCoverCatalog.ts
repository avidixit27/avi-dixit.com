import { buildPhotoFromModules } from "../photoCatalog";
import type { PhotoDetails } from "../photoTypes";
import { KERALA_PHOTO_DETAILS } from "./kerala/photoDetails";
import { NATURE_PHOTO_DETAILS } from "./nature/photoDetails";
import { PARIS_FR_PHOTO_DETAILS } from "./paris-fr/photoDetails";

interface CoverDefinition {
  readonly projectId: string;
  readonly details: PhotoDetails;
}

const COVER_DEFINITIONS: Readonly<Record<string, CoverDefinition>> = {
  "../../../assets/photography/paris-fr/hand-holding-flowers.jpg": {
    projectId: "paris-fr",
    details: PARIS_FR_PHOTO_DETAILS["hand-holding-flowers.jpg"],
  },
  "../../../assets/photography/paris-fr/hanging-shoes.jpg": {
    projectId: "paris-fr",
    details: PARIS_FR_PHOTO_DETAILS["hanging-shoes.jpg"],
  },
  "../../../assets/photography/kerala/kochi-port-ocean-sky.jpg": {
    projectId: "kerala",
    details: KERALA_PHOTO_DETAILS["kochi-port-ocean-sky.jpg"],
  },
  "../../../assets/photography/kerala/palm-tree-sunset.jpg": {
    projectId: "kerala",
    details: KERALA_PHOTO_DETAILS["palm-tree-sunset.jpg"],
  },
  "../../../assets/photography/nature/leaves-and-clouds-1.jpg": {
    projectId: "nature",
    details: NATURE_PHOTO_DETAILS["leaves-and-clouds-1.jpg"],
  },
};

const fallbackModules = import.meta.glob<string>(
  [
    "../../../assets/photography/paris-fr/hand-holding-flowers.jpg",
    "../../../assets/photography/paris-fr/hanging-shoes.jpg",
    "../../../assets/photography/kerala/kochi-port-ocean-sky.jpg",
    "../../../assets/photography/kerala/palm-tree-sunset.jpg",
    "../../../assets/photography/nature/leaves-and-clouds-1.jpg",
  ],
  {
    eager: true,
    import: "default",
    query: "?portfolio-fallback&format=jpg",
  },
);
const jpegSrcSetModules = import.meta.glob<string>(
  [
    "../../../assets/photography/paris-fr/hand-holding-flowers.jpg",
    "../../../assets/photography/paris-fr/hanging-shoes.jpg",
    "../../../assets/photography/kerala/kochi-port-ocean-sky.jpg",
    "../../../assets/photography/kerala/palm-tree-sunset.jpg",
    "../../../assets/photography/nature/leaves-and-clouds-1.jpg",
  ],
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=jpg&as=srcset",
  },
);
const webpSrcSetModules = import.meta.glob<string>(
  [
    "../../../assets/photography/paris-fr/hand-holding-flowers.jpg",
    "../../../assets/photography/paris-fr/hanging-shoes.jpg",
    "../../../assets/photography/kerala/kochi-port-ocean-sky.jpg",
    "../../../assets/photography/kerala/palm-tree-sunset.jpg",
    "../../../assets/photography/nature/leaves-and-clouds-1.jpg",
  ],
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=webp&as=srcset",
  },
);
const avifSrcSetModules = import.meta.glob<string>(
  [
    "../../../assets/photography/paris-fr/hand-holding-flowers.jpg",
    "../../../assets/photography/paris-fr/hanging-shoes.jpg",
    "../../../assets/photography/kerala/kochi-port-ocean-sky.jpg",
    "../../../assets/photography/kerala/palm-tree-sunset.jpg",
    "../../../assets/photography/nature/leaves-and-clouds-1.jpg",
  ],
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=avif&as=srcset",
  },
);

export const PORTFOLIO_COVER_CATALOG = Object.freeze(
  Object.fromEntries(
    Object.entries(fallbackModules).map(([path, src]) => {
      const definition = COVER_DEFINITIONS[path];
      if (!definition) throw new Error(`Missing cover metadata for ${path}`);

      return [
        `${definition.projectId}:${definition.details.id}`,
        buildPhotoFromModules(
          definition.details,
          path,
          src,
          jpegSrcSetModules,
          avifSrcSetModules,
          webpSrcSetModules,
        ),
      ] as const;
    }),
  ),
);
