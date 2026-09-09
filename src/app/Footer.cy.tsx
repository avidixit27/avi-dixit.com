import { mount } from "@cypress/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("exposes the approved contact details and copyright", () => {
    mount(<Footer />);

    cy.get("footer").within(() => {
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
