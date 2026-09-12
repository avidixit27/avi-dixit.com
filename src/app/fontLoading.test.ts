import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const DOCUMENT_PATH = new URL("../../index.html", import.meta.url);

describe("document font loading", () => {
  it("preloads both locally hosted interface fonts without remote font requests", () => {
    const document = readFileSync(DOCUMENT_PATH, "utf8");

    expect(document).toContain('href="/src/assets/fonts/Zina-Regular.otf"');
    expect(document).toContain('href="/src/assets/fonts/Inter-Regular.woff2"');
    expect(document).toContain('as="font"');
    expect(document).not.toContain("fonts.googleapis.com");
    expect(document).not.toContain("fonts.gstatic.com");
  });
});
