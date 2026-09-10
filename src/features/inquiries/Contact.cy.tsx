import { mount } from "@cypress/react";
import Contact from "./Contact";

describe("Contact", () => {
  it("presents the current local inquiry fields without claiming delivery", () => {
    cy.viewport(390, 844);
    mount(<Contact />);

    cy.get("main")
      .should("have.class", "pt-page-content")
      .and("have.class", "sm:pt-page-content-sm")
      .and("have.css", "padding-top", "112px");
    cy.viewport(1280, 800);
    cy.get("main").should("have.css", "padding-top", "120px");
    cy.get('input[name="name"]').type("Avi").should("have.value", "Avi");
    cy.get('input[name="email"]')
      .type("avi@example.com")
      .should("have.attr", "type", "email");
    cy.get('textarea[name="message"]')
      .type("Print inquiry")
      .should("have.value", "Print inquiry");
    cy.contains("button", "Send Message").should("be.enabled");
    cy.contains(
      "p",
      "I’m available for commissions, prints, and collaborations.",
    ).should("have.class", "font-inter");
    cy.contains("a", "avidixit27@gmail.com").should("have.class", "font-inter");
    cy.contains("a", "Instagram").should("have.class", "font-inter");
  });
});
