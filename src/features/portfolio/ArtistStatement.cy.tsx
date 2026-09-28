import { mount } from "@cypress/react";
import ArtistStatement from "./ArtistStatement";

describe("ArtistStatement", () => {
  it("is inert until opened, then presents the approved statement", () => {
    const onClose = cy.stub().as("close");
    cy.window().then((window) => {
      cy.stub(window.HTMLElement.prototype, "scrollIntoView").as("scroll");
    });
    mount(<ArtistStatement isOpen={false} onClose={onClose} />).then(
      ({ rerender }) => {
        cy.get("#artist-statement")
          .should("not.be.visible")
          .parent()
          .parent()
          .should("have.attr", "aria-hidden", "true");
        cy.contains("button", "Close statement").should("be.disabled");
        cy.then(() => rerender(<ArtistStatement isOpen onClose={onClose} />));
      },
    );

    cy.get("@scroll").should("have.been.calledWith", {
      behavior: "auto",
      block: "start",
    });
    cy.get("#artist-statement").within(() => {
      cy.get("h2")
        .should("have.text", "Artist Statement")
        .and("have.class", "font-display");
      cy.contains("p", "Entropy. Chaos.")
        .parent()
        .should("have.class", "font-inter");
      cy.contains("em", "single").should("exist");
      cy.contains(
        "p",
        "And I find myself attempting to establish where I fit into this mess at the center of it all.",
      ).should("exist");
      cy.contains("button", "Close statement").click();
    });
    cy.get("@close").should("have.been.calledOnce");
  });
});
