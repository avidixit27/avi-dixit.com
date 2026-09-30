import { describe, expect, it } from "vitest";
import { buildPhotoCatalog, PHOTO_CATALOG } from "./photoCatalog";

describe("photo catalog", () => {
  it("provides uniquely identified photographs with complete intrinsic metadata", () => {
    const ids = PHOTO_CATALOG.map((photo) => photo.id);

    expect(PHOTO_CATALOG).not.toHaveLength(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      PHOTO_CATALOG.every(
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
      PHOTO_CATALOG.every(
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

    const catalog = buildPhotoCatalog(sources, sources, sources, sources);

    expect(catalog.map((photo) => photo.sequence)).toEqual([1, 2, 4, 5, 8]);
    expect(catalog.map((photo) => photo.id)).toEqual([
      "figures-behind-chair",
      "reaching-hands-reflection",
      "low-angle-mirror-portrait",
      "tilted-bedroom-mirror",
      "ground-mirror-portrait",
    ]);
  });

  it("fails fast when a bundled photograph is missing metadata or a generated source", () => {
    const fallbackModules = {
      "../../assets/photography/portfolio/unknown.JPG": "/unknown.jpg",
    };
    const knownFallbackModules = {
      "../../assets/photography/portfolio/college_film_portfolio_1.JPG":
        "/first.jpg",
    };

    expect(() => buildPhotoCatalog(fallbackModules, {}, {}, {})).toThrow(
      "Missing photo metadata",
    );
    expect(() => buildPhotoCatalog(knownFallbackModules, {}, {}, {})).toThrow(
      "Missing generated media",
    );
  });
});
