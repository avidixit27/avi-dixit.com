import { describe, expect, it } from "vitest";
import { getHeroPhotoIndices } from "./heroOrientation";

describe("getHeroPhotoIndices", () => {
  const photos = [
    { width: 6000, height: 4000 },
    { width: 4000, height: 6000 },
    { width: 3000, height: 2000 },
  ] as const;

  it("keeps catalog order while selecting photographs that match viewport orientation", () => {
    expect(getHeroPhotoIndices(photos, true)).toEqual([0, 2]);
    expect(getHeroPhotoIndices(photos, false)).toEqual([1]);
  });

  it("uses the complete catalog in its original order when no photo matches", () => {
    expect(getHeroPhotoIndices(photos.slice(0, 1), false)).toEqual([0]);
    expect(getHeroPhotoIndices([], true)).toEqual([]);
  });
});
