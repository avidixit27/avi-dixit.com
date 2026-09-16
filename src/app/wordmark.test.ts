import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORDMARK_PATH = new URL(
  "../assets/brand/avi-dixit-wordmark.svg",
  import.meta.url,
);
const PORTRAIT_PATH = new URL(
  "../assets/brand/avi-dixit-portrait.webp",
  import.meta.url,
);
const FAVICON_PATH = new URL("../../public/favicon.png", import.meta.url);

describe("wordmark asset", () => {
  it("uses outlined Zina lettering in the muted navigation color", () => {
    const wordmark = readFileSync(WORDMARK_PATH, "utf8");

    expect(wordmark).toContain('id="zina-wordmark"');
    expect(wordmark).toContain('fill="#bbb4a9"');
    expect(wordmark).not.toContain("<text");
    expect(wordmark).not.toContain("<image");
    expect(wordmark).not.toContain("data:image");
    expect(wordmark).not.toContain("Adobe Illustrator");
    expect(statSync(WORDMARK_PATH).size).toBeLessThanOrEqual(30_000);
  });
});

describe("navigation raster assets", () => {
  it("uses small, correctly encoded portrait derivatives", () => {
    const portrait = readFileSync(PORTRAIT_PATH);
    const favicon = readFileSync(FAVICON_PATH);

    expect(portrait.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(portrait.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(favicon.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(favicon.readUInt32BE(16)).toBe(64);
    expect(favicon.readUInt32BE(20)).toBe(64);
    expect(portrait.length).toBeGreaterThan(2_000);
    expect(statSync(PORTRAIT_PATH).size).toBeLessThanOrEqual(50_000);
    expect(statSync(FAVICON_PATH).size).toBeLessThanOrEqual(25_000);
  });
});
