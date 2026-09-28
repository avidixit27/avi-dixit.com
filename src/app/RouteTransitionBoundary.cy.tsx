import { mount } from "@cypress/react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { resolveFeatureAvailability } from "./featureAvailability";
import RouteTransitionBoundary from "./RouteTransitionBoundary";

function mountRoute(path: string, shop: boolean, contact: boolean) {
  mount(
    <MemoryRouter initialEntries={[path]}>
      <RouteTransitionBoundary
        availability={resolveFeatureAvailability({ shop, contact })}
        portfolioGridRef={() => undefined}
      />
      <LocationPath />
    </MemoryRouter>,
  );
}

function LocationPath() {
  const location = useLocation();
  return (
    <output data-location>{`${location.pathname}${location.hash}`}</output>
  );
}

describe("RouteTransitionBoundary", () => {
  it("finishes the outgoing route before resetting the incoming route", () => {
    cy.window().then((window) => cy.stub(window, "scrollTo").as("scrollTo"));
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Link to="/contact">Open contact</Link>
        <RouteTransitionBoundary
          availability={resolveFeatureAvailability({
            shop: false,
            contact: true,
          })}
          portfolioGridRef={() => undefined}
        />
      </MemoryRouter>,
    );

    cy.contains("a", "Open contact").click();
    cy.get('[data-route-content="true"]')
      .should("have.length", 1)
      .and("have.attr", "aria-label", "Portfolio");
    cy.get("@scrollTo").should("not.have.been.called");
    cy.get('[data-route-content="true"]')
      .should("have.length", 1)
      .and("have.attr", "aria-label", "Contact");
    cy.get("@scrollTo").should("have.been.calledOnceWith", 0, 0);
  });

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
    mountRoute("/SHOP/", true, false);
    cy.contains("h1", "Print shop").should("be.visible");
    cy.get('[data-route-content="true"]').should(
      "have.attr",
      "aria-label",
      "Print shop",
    );

    mountRoute("/CONTACT/", false, true);
    cy.contains("h1", "Contact").should("be.visible");
    cy.get('[data-route-content="true"]').should(
      "have.attr",
      "aria-label",
      "Contact",
    );
  });

  it("redirects the legacy artist statement route to the expanded portfolio", () => {
    mountRoute("/artist-statement", false, true);

    cy.get("[data-location]").should("have.text", "/#artist-statement");
    cy.get("#artist-statement").should("be.visible");
    cy.get('[data-route-content="true"]').should(
      "have.attr",
      "aria-label",
      "Portfolio",
    );
  });

  it("does not reset scroll for the Home statement hash", () => {
    cy.window().then((window) => cy.stub(window, "scrollTo").as("scrollTo"));
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Link to="/#artist-statement">Open statement</Link>
        <RouteTransitionBoundary
          availability={resolveFeatureAvailability({
            shop: false,
            contact: true,
          })}
          portfolioGridRef={() => undefined}
        />
      </MemoryRouter>,
    );

    cy.contains("a", "Open statement").click();
    cy.get("#artist-statement").should("be.visible");
    cy.get("@scrollTo").should("not.have.been.called");
  });
});
