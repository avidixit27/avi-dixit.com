import { describe, expect, it } from "vitest";
import { getHeroPhotoIndices } from "./heroOrientation";

describe("getHeroPhotoIndices", () => {
  const photos = [
    { id: "first", width: 6000, height: 4000 },
    { id: "portrait", width: 4000, height: 6000 },
    { id: "preferred", width: 3000, height: 2000 },
  ] as const;

  it("keeps catalog order while selecting photographs that match viewport orientation", () => {
    expect(getHeroPhotoIndices(photos, true)).toEqual([0, 2]);
    expect(getHeroPhotoIndices(photos, false)).toEqual([1]);
  });

  it("uses the complete catalog in its original order when no photo matches", () => {
    expect(getHeroPhotoIndices(photos.slice(0, 1), false)).toEqual([0]);
    expect(getHeroPhotoIndices([], true)).toEqual([]);
  });

  it("starts with the configured cover without duplicating it", () => {
    expect(getHeroPhotoIndices(photos, true, "preferred")).toEqual([2, 0]);
    expect(getHeroPhotoIndices(photos, false, "preferred")).toEqual([2, 1]);
  });
});
