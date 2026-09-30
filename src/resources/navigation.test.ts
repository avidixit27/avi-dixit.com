import { describe, expect, it } from "vitest";
import { NAVIGATION_ITEMS, ROUTES } from "./navigation";

describe("site navigation resources", () => {
  it("provides unique, root-relative routes and excludes document links from navigation", () => {
    const routePaths = Object.values(ROUTES);
    const navigationPaths = NAVIGATION_ITEMS.map((item) => item.path);

    expect(new Set(routePaths).size).toBe(routePaths.length);
    expect(new Set(navigationPaths).size).toBe(navigationPaths.length);
    expect(navigationPaths).toEqual([ROUTES.home, ROUTES.shop, ROUTES.contact]);
    expect(navigationPaths).not.toContain(ROUTES.artistStatement);
    expect(NAVIGATION_ITEMS.every((item) => item.label.trim().length > 0)).toBe(
      true,
    );
    expect(routePaths.every((path) => path.startsWith("/"))).toBe(true);
  });
});
