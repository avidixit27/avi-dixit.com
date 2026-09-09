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
          photo.sources.length === 1 &&
          photo.sources[0]?.type === "image/webp" &&
          (photo.sources[0]?.srcSet.length ?? 0) > 0,
      ),
    ).toBe(true);
  });

  it("fails fast when a bundled photograph is missing metadata or a generated source", () => {
    const fallbackModules = {
      "../../assets/photography/portfolio/unknown.JPG": "/unknown.jpg",
    };
    const knownFallbackModules = {
      "../../assets/photography/portfolio/college_film_portfolio_1.JPG":
        "/first.jpg",
    };

    expect(() => buildPhotoCatalog(fallbackModules, {}, {})).toThrow(
      "Missing photo metadata",
    );
    expect(() => buildPhotoCatalog(knownFallbackModules, {}, {})).toThrow(
      "Missing generated media",
    );
  });
});
