import { describe, expect, it, vi } from "vitest";
import { preloadPortfolioProject } from "./portfolioProjectModules";

const routeModule = vi.hoisted(() => {
  const { promise, resolve } = Promise.withResolvers<void>();
  return { promise, release: resolve, requested: vi.fn() };
});

vi.mock("./PortfolioProjectRoute", async (importOriginal) => {
  routeModule.requested();
  await routeModule.promise;
  return importOriginal();
});

describe("portfolio project module preloading", () => {
  it("does not report readiness before the lazy route wrapper loads", async () => {
    const ready = vi.fn();
    const loading = preloadPortfolioProject("kerala").then(ready);
    try {
      await vi.waitFor(() =>
        expect(routeModule.requested).toHaveBeenCalledOnce(),
      );
      expect(ready).not.toHaveBeenCalled();
    } finally {
      routeModule.release();
    }
    await loading;
    expect(ready).toHaveBeenCalledWith(true);
  });

  it.each(["paris-fr", "kerala", "nature"])(
    "preloads the %s route",
    async (slug) => {
      await expect(preloadPortfolioProject(slug)).resolves.toBe(true);
    },
  );

  it("rejects unknown portfolio routes", async () => {
    await expect(preloadPortfolioProject("missing")).resolves.toBe(false);
  });
});
