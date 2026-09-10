import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORDMARK_PATH = new URL(
  "../assets/brand/avi-dixit-wordmark.svg",
  import.meta.url,
);

describe("wordmark asset", () => {
  it("uses outlined Zina lettering in the muted navigation color", () => {
    const wordmark = readFileSync(WORDMARK_PATH, "utf8");

    expect(wordmark).toContain('id="zina-wordmark"');
    expect(wordmark).toContain('fill="#bbb4a9"');
    expect(wordmark).not.toContain("<text");
  });
});
