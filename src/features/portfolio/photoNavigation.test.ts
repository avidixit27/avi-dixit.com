import { describe, expect, it } from "vitest";
import {
  getAdjacentPhotoIndex,
  getLandscapePhotoIndices,
  getPhotoIndexByOffset,
  getSurroundingPhotoIndices,
} from "./photoNavigation";

describe("getAdjacentPhotoIndex", () => {
  const landscapeIndices = [1, 4, 7] as const;

  it("returns null when navigation has no current or eligible photo", () => {
    expect(getAdjacentPhotoIndex(null, landscapeIndices, 1)).toBeNull();
    expect(getAdjacentPhotoIndex(1, [], 1)).toBeNull();
  });

  it("moves in both directions and wraps at either end", () => {
    expect(getAdjacentPhotoIndex(1, landscapeIndices, 1)).toBe(4);
    expect(getAdjacentPhotoIndex(7, landscapeIndices, 1)).toBe(1);
    expect(getAdjacentPhotoIndex(7, landscapeIndices, -1)).toBe(4);
    expect(getAdjacentPhotoIndex(1, landscapeIndices, -1)).toBe(7);
  });

  it("selects the nearest eligible photo when the current photo is ineligible", () => {
    expect(getAdjacentPhotoIndex(5, landscapeIndices, 1)).toBe(7);
    expect(getAdjacentPhotoIndex(5, landscapeIndices, -1)).toBe(4);
    expect(getAdjacentPhotoIndex(9, landscapeIndices, 1)).toBe(1);
    expect(getAdjacentPhotoIndex(0, landscapeIndices, -1)).toBe(7);
  });
});

describe("getPhotoIndexByOffset", () => {
  const landscapeIndices = [1, 4, 7] as const;

  it("moves by a signed offset and wraps around the eligible photos", () => {
    expect(getPhotoIndexByOffset(4, landscapeIndices, 2)).toBe(1);
    expect(getPhotoIndexByOffset(4, landscapeIndices, -2)).toBe(7);
  });
});

describe("getSurroundingPhotoIndices", () => {
  it("returns a deduplicated rolling window in navigation priority order", () => {
    expect(getSurroundingPhotoIndices(2, [0, 2, 4, 6, 8, 10], 3, 2)).toEqual([
      4, 6, 8, 0, 10,
    ]);
    expect(getSurroundingPhotoIndices(0, [0, 2], 3, 2)).toEqual([2]);
  });
});

describe("getLandscapePhotoIndices", () => {
  it("uses intrinsic dimensions without loading browser images", () => {
    expect(
      getLandscapePhotoIndices([
        { width: 6000, height: 4000 },
        { width: 4000, height: 6000 },
        { width: 1800, height: 1000 },
      ]),
    ).toEqual([0, 2]);
  });
});
