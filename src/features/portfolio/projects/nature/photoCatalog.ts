import { buildPhotoCatalog } from "../../photoCatalog";
import { NATURE_PHOTO_DETAILS } from "./photoDetails";

const fallbackModules = import.meta.glob<string>(
  "../../../../assets/photography/nature/*.jpg",
  { eager: true, import: "default", query: "?portfolio-fallback&format=jpg" },
);
const jpegSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/nature/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=jpg&as=srcset",
  },
);
const webpSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/nature/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=webp&as=srcset",
  },
);
const avifSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/nature/*.jpg",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=avif&as=srcset",
  },
);

export const NATURE_PHOTO_CATALOG = buildPhotoCatalog(
  NATURE_PHOTO_DETAILS,
  fallbackModules,
  jpegSrcSetModules,
  avifSrcSetModules,
  webpSrcSetModules,
);
