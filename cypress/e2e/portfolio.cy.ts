describe("photography portfolio", () => {
  it("opens, navigates, and closes the gallery", () => {
    cy.visit("/");
    cy.get('[aria-label="Open hero image gallery"]')
      .should("be.visible")
      .click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get("html").should("have.class", "modal-open");
    cy.get('[aria-label="Next image"]').click();
    cy.get('[role="dialog"] img').should("be.visible");
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.get("html").should("not.have.class", "modal-open");
  });

  it("supports the current shop and contact route behavior", () => {
    cy.visit("/shop");
    cy.contains("button", "Add to Cart").first().click().click();
    cy.contains("Cart (2)").should("be.visible");
    cy.contains("Total:").parent().should("contain.text", "$298.00");

    cy.visit("/contact");
    cy.get('input[name="email"]').should("have.attr", "type", "email");
    cy.contains("button", "Send Message").should("be.enabled");
  });

  it("keeps primary navigation and gallery access usable on mobile", () => {
    cy.viewport(390, 844);
    cy.visit("/");
    cy.contains("a", "SHOP").should("be.visible");
    cy.get('[aria-label="Open hero image gallery"]').should("be.visible");
    cy.get('[aria-label^="Open Photo"]')
      .first()
      .scrollIntoView()
      .should("be.visible");
  });

  it("renders content when reduced motion is requested", () => {
    Cypress.automation("remote:debugger:protocol", {
      command: "Emulation.setEmulatedMedia",
      params: {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      },
    });
    cy.visit("/");
    cy.get('[aria-label="Open hero image gallery"]').should("be.visible");
  });
});
