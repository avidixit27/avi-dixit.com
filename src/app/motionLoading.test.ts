import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MOTION_PROVIDER_PATH = new URL("./MotionProvider.tsx", import.meta.url);

describe("motion feature loading", () => {
  it("keeps route animation features available for the first interaction", () => {
    const provider = readFileSync(MOTION_PROVIDER_PATH, "utf8");

    expect(provider).toMatch(
      /import\s*{[^}]*domAnimation[^}]*}\s*from\s*"motion\/react"/,
    );
    expect(provider).toContain("features={domAnimation}");
    expect(provider).not.toContain('import("./motionFeatures")');
  });
});
