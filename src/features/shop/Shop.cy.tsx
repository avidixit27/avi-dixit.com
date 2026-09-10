import { mount } from "@cypress/react";
import Shop from "./Shop";

describe("Shop", () => {
  it("uses Inter for the print-collection summary", () => {
    cy.viewport(390, 844);
    mount(<Shop />);

    cy.get(".page-container")
      .should("have.class", "pt-page-content")
      .and("have.class", "sm:pt-page-content-sm")
      .and("have.css", "padding-top", "112px");
    cy.viewport(1280, 800);
    cy.get(".page-container").should("have.css", "padding-top", "120px");
    cy.contains(
      "p",
      "Explore the current print collections and prepare a selection.",
    ).should("have.class", "font-inter");
  });
});
