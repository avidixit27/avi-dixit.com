describe("photography portfolio", () => {
  it("serves responsive media with bounded first-view priority", () => {
    cy.visit("/");

    cy.get('[aria-label="Open hero image gallery"] img')
      .should("have.length", 2)
      .first()
      .should("have.attr", "srcset")
      .and("match", /480w.*960w.*1440w.*2160w/);
    cy.get('[aria-label="Open hero image gallery"] img')
      .first()
      .should("have.attr", "fetchpriority", "high")
      .should(($image) => {
        expect($image.attr("width")).to.match(/^\d+$/);
        expect($image.attr("height")).to.match(/^\d+$/);
      });
    cy.get('[aria-label="Open hero image gallery"] img')
      .eq(1)
      .should("have.attr", "fetchpriority", "low");

    cy.get('[aria-label^="Open "] img')
      .eq(2)
      .should("have.attr", "loading", "lazy")
      .and("have.attr", "fetchpriority", "low")
      .and("have.attr", "sizes")
      .and("contain", "min-width: 1024px");

    cy.get('[aria-label="Open hero image gallery"] img')
      .first()
      .should("have.prop", "currentSrc")
      .and("match", /-[\w-]+\.(?:jpg|webp)$/);
  });

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
    cy.get('main [aria-label^="Open "]')
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
