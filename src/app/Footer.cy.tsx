import { mount } from "@cypress/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("exposes the approved contact details, signature, and desktop stationary treatment", () => {
    cy.viewport(1280, 800);
    mount(<Footer />);

    cy.get('footer[aria-label="Site footer"]')
      .should("have.css", "position", "fixed")
      .within(() => {
        cy.get('img[alt=""]').should("have.attr", "aria-hidden", "true");
        cy.contains("a", "avidixit27@gmail.com").should(
          "have.attr",
          "href",
          "mailto:avidixit27@gmail.com",
        );
        cy.contains("a", "Instagram")
          .should(
            "have.attr",
            "href",
            "https://www.instagram.com/_avid.photography_/",
          )
          .and("have.attr", "target", "_blank")
          .and("have.attr", "rel", "noopener noreferrer");
        cy.contains("Copyright @Avi Dixit 2026");
      });
  });
});
