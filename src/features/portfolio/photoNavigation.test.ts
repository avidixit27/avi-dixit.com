import { describe, expect, it } from "vitest";
import { getAdjacentPhotoIndex } from "./photoNavigation";

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
