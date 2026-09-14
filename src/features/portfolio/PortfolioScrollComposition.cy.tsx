import { mount } from "@cypress/react";
import PortfolioScrollComposition from "./PortfolioScrollComposition";
import type { Photo } from "./photoCatalog";

function createPhoto(id: string, alt: string): Photo {
  return {
    id,
    src: `/${id}.jpg`,
    srcSet: `/${id}-480.jpg 480w, /${id}-960.jpg 960w`,
    sources: [
      {
        type: "image/webp",
        srcSet: `/${id}-480.webp 480w, /${id}-960.webp 960w`,
      },
    ],
    width: 6000,
    height: 4000,
    aspectRatio: 1.5,
    alt,
  };
}

const photos = [
  createPhoto("ground-mirror-portrait", "Ground mirror portrait"),
  createPhoto("outdoor-crouching-reflection", "Outdoor crouching reflection"),
] as const satisfies readonly Photo[];

describe("PortfolioScrollComposition", () => {
  it("presents the approved editorial sequence with CSS-owned sticky media", () => {
    const onOpen = cy.spy().as("onOpen");
    mount(<PortfolioScrollComposition photos={photos} onOpen={onOpen} />);

    cy.contains("p", "Entropy / Chaos").should("be.visible");
    cy.get('[data-portfolio-layer="intro"]')
      .should("have.class", "md:sticky")
      .and("have.class", "md:top-0")
      .parents('[data-portfolio-stack-boundary="intro"]')
      .should("have.length", 1);
    cy.contains("h2", /all I could see was mayhem/).should("be.visible");
    cy.contains("p", /more chaos. Static/).should("be.visible");
    cy.get('[data-portfolio-sticky="true"]')
      .should("have.class", "md:sticky")
      .within(() => {
        cy.get("button").should("not.have.class", "hover:scale-[1.01]");
        cy.get("button").should("not.have.class", "hover:border-border-strong");
        cy.get('[data-portfolio-sticky-content="true"]').should("be.visible");
        cy.get('img[alt="Ground mirror portrait"]').should("be.visible");
      });
    cy.contains("h2", /Everyone who has ever lived/).should("be.visible");
    cy.get('[data-portfolio-parallax="true"]')
      .find('img[alt="Outdoor crouching reflection"]')
      .should("be.visible");
    cy.contains("p", "At the center").should("be.visible");
    cy.get('[data-portfolio-layer="release"]')
      .should("have.class", "md:sticky")
      .and("have.class", "md:bottom-0")
      .parents('[data-portfolio-stack-boundary="release"]')
      .should("have.length", 1);
    cy.contains("h2", "Something delightful and endlessly intriguing.").should(
      "be.visible",
    );

    cy.get('[data-portfolio-sticky="true"] button').click();
    cy.get("@onOpen").should(
      "have.been.calledWith",
      0,
      Cypress.sinon.match(/ground-mirror-portrait/),
    );
    cy.get('[data-portfolio-parallax="true"] button').click();
    cy.get("@onOpen").should(
      "have.been.calledWith",
      1,
      Cypress.sinon.match(/outdoor-crouching-reflection/),
    );
  });
});
