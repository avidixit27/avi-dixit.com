import { buildPhotoCatalog } from "../../photoCatalog";
import type { PhotoDetails } from "../../photoTypes";

const PHOTO_DETAILS = {
  "hand-holding-flowers.jpg": {
    id: "hand-holding-flowers",
    sequence: 1,
    alt: "A hand holding flowers in Paris",
    width: 5626,
    height: 4000,
  },
  "hanging-shoes.jpg": {
    id: "hanging-shoes",
    sequence: 2,
    alt: "Shoes hanging overhead in Paris",
    width: 3915,
    height: 5872,
  },
  "merry-go-round-horse.jpg": {
    id: "merry-go-round-horse",
    sequence: 3,
    alt: "A merry-go-round horse in Paris",
    width: 5910,
    height: 3281,
  },
} as const satisfies Record<string, PhotoDetails>;

const fallbackModules = import.meta.glob<string>(
  "../../../../assets/photography/paris-fr/*.jpg",
  { eager: true, import: "default", query: "?portfolio-fallback&format=jpg" },
);
const jpegSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/paris-fr/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=jpg&as=srcset",
  },
);
const webpSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/paris-fr/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=webp&as=srcset",
  },
);
const avifSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/paris-fr/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=avif&as=srcset",
  },
);

export const PARIS_FR_PHOTO_CATALOG = buildPhotoCatalog(
  PHOTO_DETAILS,
  fallbackModules,
  jpegSrcSetModules,
  avifSrcSetModules,
  webpSrcSetModules,
);
