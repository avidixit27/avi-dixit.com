import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("./portfolioProjects", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./portfolioProjects")>()),
  getPortfolioProject: vi.fn(() => undefined),
}));

import PortfolioProjectRoute from "./PortfolioProjectRoute";

describe("PortfolioProjectRoute", () => {
  it("renders the 404 for a registered project that is unavailable", () => {
    const route = createElement(Route, {
      path: "/portfolio/:slug",
      element: createElement(PortfolioProjectRoute, { gridMarkerRef: null }),
    });
    const routes = createElement(Routes, null, route);
    const router = createElement(
      MemoryRouter,
      { initialEntries: ["/portfolio/paris-fr"] },
      routes,
    );

    expect(renderToStaticMarkup(router)).toContain("Page not found");
  });
});
