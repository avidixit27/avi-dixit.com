import { mount } from "@cypress/react";
import RouteLoadingFallback from "./RouteLoadingFallback";

describe("RouteLoadingFallback", () => {
  for (const [width, height] of [
    [1280, 720],
    [390, 844],
  ] as const) {
    it(`fills the ${width} × ${height} viewport with shimmer and screen-reader-only status text`, () => {
      cy.viewport(width, height);
      mount(<RouteLoadingFallback showImageSkeleton />);
      cy.get('[role="status"]')
        .should("have.class", "image-skeleton")
        .should("have.attr", "aria-live", "polite")
        .should(($status) => {
          const bounds = $status.get(0).getBoundingClientRect();
          expect(bounds.width).to.equal(width);
          expect(bounds.height).to.equal(height);
        })
        .find("span")
        .should("have.text", "Loading page…")
        .and("have.css", "position", "absolute")
        .and("have.css", "width", "1px")
        .and("have.css", "height", "1px")
        .and("have.css", "clip-path", "inset(50%)");
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
