import { describe, expect, it } from "vitest";
import {
  getAdjacentPhotoIndex,
  getPhotoIndexByOffset,
  getSurroundingPhotoIndices,
} from "./photoNavigation";

describe("getAdjacentPhotoIndex", () => {
  const eligibleIndices = [1, 4, 7] as const;

  it("returns null when navigation has no current or eligible photo", () => {
    expect(getAdjacentPhotoIndex(null, eligibleIndices, 1)).toBeNull();
    expect(getAdjacentPhotoIndex(1, [], 1)).toBeNull();
  });

  it("moves in both directions and wraps at either end", () => {
    expect(getAdjacentPhotoIndex(1, eligibleIndices, 1)).toBe(4);
    expect(getAdjacentPhotoIndex(7, eligibleIndices, 1)).toBe(1);
    expect(getAdjacentPhotoIndex(7, eligibleIndices, -1)).toBe(4);
    expect(getAdjacentPhotoIndex(1, eligibleIndices, -1)).toBe(7);
  });

  it("selects the nearest eligible photo when the current photo is ineligible", () => {
    expect(getAdjacentPhotoIndex(5, eligibleIndices, 1)).toBe(7);
    expect(getAdjacentPhotoIndex(5, eligibleIndices, -1)).toBe(4);
    expect(getAdjacentPhotoIndex(9, eligibleIndices, 1)).toBe(1);
    expect(getAdjacentPhotoIndex(0, eligibleIndices, -1)).toBe(7);
  });
});

describe("getPhotoIndexByOffset", () => {
  const eligibleIndices = [1, 4, 7] as const;

  it("moves by a signed offset and wraps around the eligible photos", () => {
    expect(getPhotoIndexByOffset(4, eligibleIndices, 2)).toBe(1);
    expect(getPhotoIndexByOffset(4, eligibleIndices, -2)).toBe(7);
  });

  it("keeps an eligible current photo for a zero offset and rejects an ineligible one", () => {
    expect(getPhotoIndexByOffset(4, eligibleIndices, 0)).toBe(4);
    expect(getPhotoIndexByOffset(3, eligibleIndices, 0)).toBeNull();
  });

  it("stops when movement cannot find an eligible photo", () => {
    expect(getPhotoIndexByOffset(3, [], 1)).toBeNull();
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
