import { mount } from "@cypress/react";
import Contact from "./Contact";

describe("Contact", () => {
  it("presents the current local inquiry fields without claiming delivery", () => {
    mount(<Contact />);

    cy.get('input[name="name"]').type("Avi").should("have.value", "Avi");
    cy.get('input[name="email"]')
      .type("avi@example.com")
      .should("have.attr", "type", "email");
    cy.get('textarea[name="message"]')
      .type("Print inquiry")
      .should("have.value", "Print inquiry");
    cy.contains("button", "Send Message").should("be.enabled");
  });
});
