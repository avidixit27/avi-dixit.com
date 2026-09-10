import { mount } from "@cypress/react";
import { MemoryRouter } from "react-router-dom";
import Navigation from "./Navigation";

describe("Navigation", () => {
  it("renders route links and marks the current destination", () => {
    mount(
      <MemoryRouter initialEntries={["/shop"]}>
        <Navigation portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.contains("a", "HOME").should("have.attr", "href", "/");
    cy.contains("a", "SHOP")
      .should("have.attr", "href", "/shop")
      .and("have.class", "text-focus")
      .and("not.have.class", "font-bold");
    cy.contains("a", "CONTACT").should("have.attr", "href", "/contact");
  });

  it("uses the project display-font token for navigation labels", () => {
    mount(
      <MemoryRouter>
        <Navigation portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.contains("a", "SHOP")
      .should("have.class", "font-display")
      .and("not.have.class", "font-bold");
  });

  it("keeps the larger wordmark centered in the navigation row", () => {
    mount(
      <MemoryRouter>
        <Navigation portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.get('img[alt="Avi Dixit"]')
      .should("have.class", "h-12")
      .and("have.class", "md:h-14")
      .then(($wordmark) => {
        const wordmark = $wordmark.get(0);
        const navigation = wordmark?.closest("nav");
        if (!wordmark || !navigation) {
          throw new Error("Expected the navigation wordmark");
        }

        const wordmarkCenter =
          wordmark.getBoundingClientRect().top +
          wordmark.getBoundingClientRect().height / 2;
        const navigationCenter =
          navigation.getBoundingClientRect().top +
          navigation.getBoundingClientRect().height / 2;
        expect(Math.abs(wordmarkCenter - navigationCenter)).to.be.lessThan(1);
      });
  });

  it("keeps the approved 32px gap between adjacent navigation labels", () => {
    cy.viewport(1280, 800);
    mount(
      <MemoryRouter>
        <Navigation portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.contains("a", "HOME").parent().should("have.class", "flex");

    cy.contains("a", "HOME").then(($home) => {
      cy.contains("a", "SHOP").then(($shop) => {
        cy.contains("a", "CONTACT").then(($contact) => {
          const home = $home.get(0);
          const shop = $shop.get(0);
          const contact = $contact.get(0);
          if (!home || !shop || !contact) {
            throw new Error("Expected each navigation link");
          }

          const homeRect = home.getBoundingClientRect();
          const shopRect = shop.getBoundingClientRect();
          const contactRect = contact.getBoundingClientRect();
          const homeToShopGap = shopRect.left - homeRect.right;
          const shopToContactGap = contactRect.left - shopRect.right;

          expect(homeToShopGap).to.equal(32);
          expect(shopToContactGap).to.equal(32);
        });
      });
    });
  });
});
