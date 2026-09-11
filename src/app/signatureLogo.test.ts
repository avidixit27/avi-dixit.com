import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SIGNATURE_LOGO_PATH = new URL(
  "../assets/icons/avi-signature-logo.svg",
  import.meta.url,
);

describe("signature logo asset", () => {
  it("uses the approved cream fill", () => {
    const signatureLogo = readFileSync(SIGNATURE_LOGO_PATH, "utf8");

    expect(signatureLogo).toContain('fill="#ffe193"');
    expect(signatureLogo).not.toContain('fill="#fd7100"');
  });
});
