import { buildPhotoCatalog } from "../../photoCatalog";
import type { PhotoDetails } from "../../photoTypes";

const PHOTO_DETAILS = {
  "college_film_portfolio_1.JPG": {
    id: "reaching-hands-reflection",
    sequence: 2,
    alt: "Two hands reaching toward each other across a mirror frame",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_2.JPG": {
    id: "shadowed-bedroom-reflection",
    sequence: 3,
    alt: "A shadowed portrait reflected in a bedroom mirror",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_3.JPG": {
    id: "outdoor-self-portrait",
    sequence: 10,
    alt: "A person photographing their reflection in a tall mirror outdoors",
    width: 4000,
    height: 6000,
  },
  "college_film_portfolio_4.JPG": {
    id: "ground-mirror-portrait",
    sequence: 8,
    alt: "A seated person looking into a small mirror on the ground",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_5.JPG": {
    id: "grass-mirror-reflection",
    sequence: 9,
    alt: "A face and tree canopy reflected in a mirror lying on grass",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_6.JPG": {
    id: "figures-behind-chair",
    sequence: 1,
    alt: "Two figures leaning together behind the back of a chair",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_7.JPG": {
    id: "tilted-bedroom-mirror",
    sequence: 5,
    alt: "A seated portrait reflected in a tilted bedroom mirror",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_8.JPG": {
    id: "low-angle-mirror-portrait",
    sequence: 4,
    alt: "A low-angle portrait framed by mirror edges and shadows",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_9.JPG": {
    id: "outdoor-crouching-reflection",
    sequence: 6,
    alt: "A crouching figure partially reflected in a small outdoor mirror",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_10.JPG": {
    id: "fragmented-hand-portrait",
    sequence: 11,
    alt: "Hands holding mirror fragments around a reflected portrait",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_11.JPG": {
    id: "small-mirror-outdoors",
    sequence: 7,
    alt: "A person holding a small mirror that reflects a face outdoors",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_12.JPG": {
    id: "face-among-trees",
    sequence: 12,
    alt: "A shadowed face reflected among trees",
    width: 6000,
    height: 4000,
  },
} as const satisfies Record<string, PhotoDetails>;

const fallbackModules = import.meta.glob<string>(
  "../../../../assets/photography/portfolio/*.JPG",
  { eager: true, import: "default", query: "?portfolio-fallback&format=jpg" },
);
const jpegSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/portfolio/*.JPG",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=jpg&as=srcset",
  },
);
const webpSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/portfolio/*.JPG",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=webp&as=srcset",
  },
);
const avifSrcSetModules = import.meta.glob<string>(
  "../../../../assets/photography/portfolio/*.JPG",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=avif&as=srcset",
  },
);

export const FILM_PHOTO_CATALOG = buildPhotoCatalog(
  PHOTO_DETAILS,
  fallbackModules,
  jpegSrcSetModules,
  avifSrcSetModules,
  webpSrcSetModules,
);
