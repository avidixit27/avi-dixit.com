import { mount } from "@cypress/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the copyright-only footer with its complete decorative signature", () => {
    cy.viewport(1280, 800);
    mount(<Footer />);

    cy.get('footer[aria-label="Site footer"]').within(() => {
      cy.get('img[alt=""]').should("have.attr", "aria-hidden", "true");
      cy.get("a").should("not.exist");
      cy.contains("Copyright @Avi Dixit 2026")
        .should("have.class", "font-footer")
        .and("have.class", "text-footer-copy")
        .and(
          "have.class",
          "right-[max(1rem,calc(env(safe-area-inset-right)+0.75rem))]",
        )
        .should("have.css", "font-size", "10px");
    });
  });
});
