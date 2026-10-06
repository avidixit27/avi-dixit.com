import { buildPhotoCatalog } from "../../photoCatalog";
import type { PhotoDetails } from "../../photoTypes";

const PHOTO_DETAILS = {
  "person-before-field.jpg": {
    id: "person-before-field",
    sequence: 2,
    alt: "A person standing before a field in Alleppey",
    width: 6000,
    height: 4000,
  },
  "palm-tree-sunset.jpg": {
    id: "palm-tree-sunset",
    sequence: 3,
    alt: "A palm tree at sunset in Alleppey",
    width: 6000,
    height: 4000,
  },
  "kochi-port-ocean-sky.jpg": {
    id: "kochi-port-ocean-sky",
    sequence: 1,
    alt: "Kochi port beneath an ocean sky",
    width: 6000,
    height: 4000,
  },
} as const satisfies Record<string, PhotoDetails>;

const fallbackModules = import.meta.glob<string>(
  "../../../../assets/photography/kerala/*.jpg",
  { eager: true, import: "default", query: "?portfolio-fallback&format=jpg" },
);
const jpegSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/kerala/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=jpg&as=srcset",
  },
);
const webpSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/kerala/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=webp&as=srcset",
  },
);
const avifSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/kerala/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=avif&as=srcset",
  },
);

export const KERALA_PHOTO_CATALOG = buildPhotoCatalog(
  PHOTO_DETAILS,
  fallbackModules,
  jpegSrcSetModules,
  avifSrcSetModules,
  webpSrcSetModules,
);
