import { mount } from "@cypress/react";
import RouteLoadingFallback from "./RouteLoadingFallback";

describe("RouteLoadingFallback", () => {
  for (const [width, height] of [
    [1280, 720],
    [390, 844],
  ] as const) {
    it(`centers the loading text in the ${width} × ${height} viewport`, () => {
      cy.viewport(width, height);
      mount(<RouteLoadingFallback showImageSkeleton />);
      cy.get('[role="status"]')
        .should("have.class", "image-skeleton")
        .should("have.attr", "aria-live", "polite")
        .find("span")
        .should(($text) => {
          const bounds = $text.get(0).getBoundingClientRect();
          expect(bounds.left + bounds.width / 2).to.be.closeTo(width / 2, 1);
          expect(bounds.top + bounds.height / 2).to.be.closeTo(height / 2, 1);
        });
      cy.screenshot(`loading-shimmer-${width}`);
    });
  }

  it("keeps non-image routes plain and disables shimmer with reduced motion", () => {
    mount(<RouteLoadingFallback />);
    cy.get('[role="status"]').should("not.have.class", "image-skeleton");
    cy.then(() =>
      Cypress.automation("remote:debugger:protocol", {
        command: "Emulation.setEmulatedMedia",
        params: {
          features: [{ name: "prefers-reduced-motion", value: "reduce" }],
        },
      }),
    );
    mount(<RouteLoadingFallback showImageSkeleton />);
    cy.get('[role="status"]').should(($status) => {
      expect(
        getComputedStyle($status.get(0), "::before").animationName,
      ).to.equal("none");
    });
  });

  afterEach(() => {
    cy.then(() =>
      Cypress.automation("remote:debugger:protocol", {
        command: "Emulation.setEmulatedMedia",
        params: { features: [] },
      }),
    );
  });
});
