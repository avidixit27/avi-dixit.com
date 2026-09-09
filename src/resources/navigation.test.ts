import { describe, expect, it } from "vitest";
import { NAVIGATION_ITEMS, ROUTES } from "./navigation";

describe("site navigation resources", () => {
  it("provides unique, root-relative routes with one navigation item each", () => {
    const routePaths = Object.values(ROUTES);
    const navigationPaths = NAVIGATION_ITEMS.map((item) => item.path);

    expect(new Set(routePaths).size).toBe(routePaths.length);
    expect(new Set(navigationPaths).size).toBe(navigationPaths.length);
    expect(navigationPaths).toEqual(routePaths);
    expect(NAVIGATION_ITEMS.every((item) => item.label.trim().length > 0)).toBe(
      true,
    );
    expect(routePaths.every((path) => path.startsWith("/"))).toBe(true);
  });
});
