import { describe, expect, it } from "vitest";
import { isAllFeaturesDevelopment } from "../../vite.config";

describe("all-features Vite mode", () => {
  it("enables the override only for the all-features development server", () => {
    expect(isAllFeaturesDevelopment("serve", "all-features")).toBe(true);
    expect(isAllFeaturesDevelopment("serve", "development")).toBe(false);
    expect(isAllFeaturesDevelopment("build", "all-features")).toBe(false);
    expect(isAllFeaturesDevelopment("preview", "all-features")).toBe(false);
  });
});
