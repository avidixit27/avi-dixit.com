import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const RESUME_PATH = new URL(
  "../assets/documents/avi-dixit-resume.pdf",
  import.meta.url,
);

describe("portfolio document assets", () => {
  it("keeps the approved résumé as a small PDF", () => {
    const resume = readFileSync(RESUME_PATH);

    expect(resume.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(statSync(RESUME_PATH).size).toBeLessThanOrEqual(250_000);
  });
});
