describe("all-features development mode", () => {
  it("keeps Shop and Contact available for their focused development journey", () => {
    cy.visit("/");
    cy.contains("a", "SHOP").should("have.attr", "href", "/shop").click();
    cy.location("pathname").should("eq", "/shop");
    cy.contains("button", "Add to Cart").first().click().click();
    cy.contains("Cart (2)").should("be.visible");
    cy.contains("Total:").parent().should("contain.text", "$298.00");

    cy.contains("a", "CONTACT").click();
    cy.location("pathname").should("eq", "/contact");
    cy.get('input[name="email"]').should("have.attr", "type", "email");
    cy.contains("button", "Send Message").should("be.enabled");
    cy.get('[data-route-content="true"]')
      .should("have.attr", "aria-label", "Contact")
      .and("have.focus");
  });
});
