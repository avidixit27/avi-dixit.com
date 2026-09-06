import type { ImageSource } from "../../components/ResponsiveImage";

export interface Photo {
  readonly id: string;
  readonly src: string;
  readonly srcSet: string;
  readonly sources: readonly ImageSource[];
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly alt: string;
}

interface PhotoDetails {
  readonly id: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

const PHOTO_DETAILS = {
  "college_film_portfolio_1.JPG": {
    id: "reaching-hands-reflection",
    alt: "Two hands reaching toward each other across a mirror frame",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_2.JPG": {
    id: "shadowed-bedroom-reflection",
    alt: "A shadowed portrait reflected in a bedroom mirror",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_3.JPG": {
    id: "outdoor-self-portrait",
    alt: "A person photographing their reflection in a tall mirror outdoors",
    width: 4000,
    height: 6000,
  },
  "college_film_portfolio_4.JPG": {
    id: "ground-mirror-portrait",
    alt: "A seated person looking into a small mirror on the ground",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_5.JPG": {
    id: "grass-mirror-reflection",
    alt: "A face and tree canopy reflected in a mirror lying on grass",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_6.JPG": {
    id: "figures-behind-chair",
    alt: "Two figures leaning together behind the back of a chair",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_7.JPG": {
    id: "tilted-bedroom-mirror",
    alt: "A seated portrait reflected in a tilted bedroom mirror",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_8.JPG": {
    id: "low-angle-mirror-portrait",
    alt: "A low-angle portrait framed by mirror edges and shadows",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_9.JPG": {
    id: "outdoor-crouching-reflection",
    alt: "A crouching figure partially reflected in a small outdoor mirror",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_10.JPG": {
    id: "fragmented-hand-portrait",
    alt: "Hands holding mirror fragments around a reflected portrait",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_11.JPG": {
    id: "small-mirror-outdoors",
    alt: "A person holding a small mirror that reflects a face outdoors",
    width: 6000,
    height: 4000,
  },
  "college_film_portfolio_12.JPG": {
    id: "face-among-trees",
    alt: "A shadowed face reflected among trees",
    width: 6000,
    height: 4000,
  },
} as const satisfies Record<string, PhotoDetails>;

const fallbackModules = import.meta.glob<string>("../../imgs/portfolio/*.JPG", {
  eager: true,
  import: "default",
  query: "?portfolio-fallback&format=jpg",
});

const jpegSrcSetModules = import.meta.glob<string>(
  "../../imgs/portfolio/*.JPG",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=jpg&as=srcset",
  },
);

const webpSrcSetModules = import.meta.glob<string>(
  "../../imgs/portfolio/*.JPG",
  {
    eager: true,
    import: "default",
    query: "?portfolio-responsive&format=webp&as=srcset",
  },
);

function isPhotoFileName(
  fileName: string,
): fileName is keyof typeof PHOTO_DETAILS {
  return fileName in PHOTO_DETAILS;
}

function getPhotoDetails(path: string): PhotoDetails {
  const fileName = path.split("/").at(-1);
  const details =
    fileName && isPhotoFileName(fileName) ? PHOTO_DETAILS[fileName] : undefined;
  if (!details) throw new Error(`Missing photo metadata for ${path}`);
  return details;
}

function getGeneratedSource(
  modules: Readonly<Record<string, string>>,
  path: string,
): string {
  const source = modules[path];
  if (!source) throw new Error(`Missing generated media for ${path}`);
  return source;
}

export const PHOTO_CATALOG = Object.freeze(
  Object.entries(fallbackModules).map(([path, src]) => {
    const details = getPhotoDetails(path);
    return Object.freeze({
      ...details,
      src,
      srcSet: getGeneratedSource(jpegSrcSetModules, path),
      sources: Object.freeze([
        Object.freeze({
          type: "image/webp",
          srcSet: getGeneratedSource(webpSrcSetModules, path),
        }),
      ]),
      aspectRatio: details.width / details.height,
    });
  }),
) satisfies readonly Photo[];
