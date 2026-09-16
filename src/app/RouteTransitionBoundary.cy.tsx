import { mount } from "@cypress/react";
import { MemoryRouter } from "react-router-dom";
import { resolveFeatureAvailability } from "./featureAvailability";
import RouteTransitionBoundary from "./RouteTransitionBoundary";

function mountRoute(path: string, shop: boolean, contact: boolean) {
  mount(
    <MemoryRouter initialEntries={[path]}>
      <RouteTransitionBoundary
        availability={resolveFeatureAvailability({ shop, contact })}
        portfolioGridRef={() => undefined}
      />
    </MemoryRouter>,
  );
}

describe("RouteTransitionBoundary", () => {
  it("uses the existing fallback and accessible label for disabled routes", () => {
    mountRoute("/shop/", false, false);

    cy.contains("h1", "Page not found").should("be.visible");
    cy.get('[data-route-content="true"]').should(
      "have.attr",
      "aria-label",
      "Page not found",
    );

    mountRoute("/contact/", false, false);
    cy.contains("h1", "Page not found").should("be.visible");
    cy.get('[data-route-content="true"]').should(
      "have.attr",
      "aria-label",
      "Page not found",
    );
  });

  it("keeps each released route independently available", () => {
    mountRoute("/shop/", true, false);
    cy.contains("h1", "Print shop").should("be.visible");
    cy.get('[data-route-content="true"]').should(
      "have.attr",
      "aria-label",
      "Print shop",
    );

    mountRoute("/contact/", false, true);
    cy.contains("h1", "Contact").should("be.visible");
    cy.get('[data-route-content="true"]').should(
      "have.attr",
      "aria-label",
      "Contact",
    );
  });
});
