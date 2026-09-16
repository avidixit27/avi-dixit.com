describe("all-features development mode", () => {
  it("keeps Shop and Contact available for their focused development journey", () => {
    cy.visit("/");
    cy.scrollTo(0, 1200);
    cy.window().its("scrollY").should("be.greaterThan", 0);

    cy.contains("a", "SHOP").should("have.attr", "href", "/shop").click();
    cy.location("pathname").should("eq", "/shop");
    cy.window().its("scrollY").should("equal", 0);
    cy.get('[data-route-content="true"]:not([aria-hidden="true"])')
      .should("have.attr", "aria-label", "Print shop")
      .and("have.focus");
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
    cy.get("footer")
      .should("contain.text", "Copyright @Avi Dixit 2026")
      .and("not.contain.text", "avidixit27@gmail.com")
      .and("not.contain.text", "Instagram");

    cy.window().then((pageWindow) => {
      cy.spy(pageWindow, "scrollTo").as("scrollTo");
    });

    cy.go("back");
    cy.location("pathname").should("eq", "/shop");
    cy.contains("h1", "Print shop").should("be.visible");

    cy.go("back");
    cy.location("pathname").should("eq", "/");
    cy.get("@scrollTo").should("not.have.been.called");
  });
});
