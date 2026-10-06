import { describe, expect, it } from "vitest";
import { buildPhotoCatalog } from "./photoCatalog";
import { FILM_PHOTO_CATALOG } from "./projects/film/photoCatalog";
import { KERALA_PHOTO_CATALOG } from "./projects/kerala/photoCatalog";

describe("photo catalog", () => {
  it("provides uniquely identified photographs with complete intrinsic metadata", () => {
    const ids = FILM_PHOTO_CATALOG.map((photo) => photo.id);

    expect(FILM_PHOTO_CATALOG).not.toHaveLength(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      FILM_PHOTO_CATALOG.every(
        (photo) =>
          photo.alt.trim().length > 0 &&
          photo.width > 0 &&
          photo.height > 0 &&
          photo.aspectRatio === photo.width / photo.height,
      ),
    ).toBe(true);
  });

  it("provides fallback and responsive source contracts for every photograph", () => {
    expect(
      FILM_PHOTO_CATALOG.every(
        (photo) =>
          photo.src.length > 0 &&
          photo.srcSet.length > 0 &&
          photo.sources.length === 2 &&
          photo.sources[0]?.type === "image/avif" &&
          photo.sources[1]?.type === "image/webp" &&
          photo.sources.every((source) => source.srcSet.length > 0),
      ),
    ).toBe(true);
  });

  it("uses the approved chronological sequence", () => {
    const sources = {
      "../../assets/photography/portfolio/college_film_portfolio_6.JPG":
        "/sixth.jpg",
      "../../assets/photography/portfolio/college_film_portfolio_4.JPG":
        "/fourth.jpg",
      "../../assets/photography/portfolio/college_film_portfolio_8.JPG":
        "/eighth.jpg",
      "../../assets/photography/portfolio/college_film_portfolio_1.JPG":
        "/first.jpg",
      "../../assets/photography/portfolio/college_film_portfolio_7.JPG":
        "/seventh.jpg",
    };

    const details = {
      "college_film_portfolio_6.JPG": {
        id: "figures-behind-chair",
        sequence: 1,
        alt: "Figures behind a chair",
        width: 6000,
        height: 4000,
      },
      "college_film_portfolio_1.JPG": {
        id: "reaching-hands-reflection",
        sequence: 2,
        alt: "Hands reflected in a mirror",
        width: 6000,
        height: 4000,
      },
      "college_film_portfolio_8.JPG": {
        id: "low-angle-mirror-portrait",
        sequence: 4,
        alt: "Low-angle mirror portrait",
        width: 6000,
        height: 4000,
      },
      "college_film_portfolio_7.JPG": {
        id: "tilted-bedroom-mirror",
        sequence: 5,
        alt: "Tilted bedroom mirror",
        width: 6000,
        height: 4000,
      },
      "college_film_portfolio_4.JPG": {
        id: "ground-mirror-portrait",
        sequence: 8,
        alt: "Ground mirror portrait",
        width: 6000,
        height: 4000,
      },
    };

    const catalog = buildPhotoCatalog(
      details,
      sources,
      sources,
      sources,
      sources,
    );

    expect(catalog.map((photo) => photo.sequence)).toEqual([1, 2, 4, 5, 8]);
    expect(catalog.map((photo) => photo.id)).toEqual([
      "figures-behind-chair",
      "reaching-hands-reflection",
      "low-angle-mirror-portrait",
      "tilted-bedroom-mirror",
      "ground-mirror-portrait",
    ]);
  });

  it("opens the Kerala collection on the port cover", () => {
    expect(KERALA_PHOTO_CATALOG[0]?.id).toBe("kochi-port-ocean-sky");
  });

  it("fails fast when a bundled photograph is missing metadata or a generated source", () => {
    const fallbackModules = {
      "../../assets/photography/portfolio/unknown.JPG": "/unknown.jpg",
    };
    const knownFallbackModules = {
      "../../assets/photography/portfolio/college_film_portfolio_1.JPG":
        "/first.jpg",
    };

    expect(() => buildPhotoCatalog({}, fallbackModules, {}, {}, {})).toThrow(
      "Missing photo metadata",
    );
    expect(() =>
      buildPhotoCatalog(
        {
          "college_film_portfolio_1.JPG": {
            id: "first",
            sequence: 1,
            alt: "First photo",
            width: 6000,
            height: 4000,
          },
        },
        knownFallbackModules,
        {},
        {},
        {},
      ),
    ).toThrow("Missing generated media");
  });
});
