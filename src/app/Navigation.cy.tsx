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
      .and("have.class", "font-extrabold");
    cy.contains("a", "CONTACT").should("have.attr", "href", "/contact");
  });
});
