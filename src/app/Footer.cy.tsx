import { mount } from "@cypress/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";
import MotionProvider from "./MotionProvider";

describe("Footer", () => {
  it("cancels an active landing when scrolling moves upward", () => {
    cy.window().then((window) => {
      cy.stub(window, "matchMedia").returns({
        matches: false,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
      } as unknown as MediaQueryList);
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 1,
      });
      cy.spy(window, "addEventListener").as("addEventListener");
    });

    mount(
      <MotionProvider>
        <MemoryRouter>
          <div className="min-h-[3000px]">
            <Footer landingEnabled />
          </div>
        </MemoryRouter>
      </MotionProvider>,
    );
    cy.get("@addEventListener").should("have.been.calledWith", "wheel");
    cy.window().then((window) => {
      cy.stub(window, "requestAnimationFrame").returns(42);
      cy.stub(window, "cancelAnimationFrame").as("cancelAnimationFrame");
      expect(window.document.documentElement.scrollHeight).to.be.greaterThan(
        window.innerHeight,
      );
      const maximumScrollY =
        window.document.documentElement.scrollHeight - window.innerHeight;
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: maximumScrollY - 1,
      });
      window.dispatchEvent(new Event("scroll"));
      const wheelEvent = new window.WheelEvent("wheel", {
        cancelable: true,
        deltaY: 10,
      });
      expect(
        window.dispatchEvent(wheelEvent),
        "Footer landing wheel should prevent default after its listener is ready",
      ).to.equal(false);
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 0,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    cy.get("@cancelAnimationFrame").should("have.been.calledOnceWith", 42);
  });

  it("leaves wheel scrolling native while a Home reset is active", () => {
    mount(
      <MotionProvider>
        <MemoryRouter>
          <Footer landingEnabled={false} />
        </MemoryRouter>
      </MotionProvider>,
    );

    cy.window().then((window) => {
      const wheelEvent = new window.WheelEvent("wheel", {
        cancelable: true,
        deltaY: 100,
      });

      expect(window.dispatchEvent(wheelEvent)).to.equal(true);
    });
  });

  it("keeps portfolio documents in the Home footer only", () => {
    cy.viewport(1280, 800);
    mount(
      <MotionProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Footer landingEnabled />
        </MemoryRouter>
      </MotionProvider>,
    );

    cy.get('[data-footer-reveal="true"]')
      .should("have.class", "h-footer")
      .within(() => {
        cy.get('footer[aria-label="Site footer"]').should(
          "have.class",
          "fixed",
        );
      });

    cy.get('footer[aria-label="Site footer"]').within(() => {
      cy.get('[data-footer-parallax-content="true"]')
        .should("have.class", "h-full")
        .and("have.class", "will-change-transform");
      cy.get('img[alt=""]').should("have.attr", "aria-hidden", "true");
      cy.get('nav[aria-label="Portfolio documents"]').within(() => {
        cy.contains("a", "Artist Statement")
          .should("have.attr", "href", "/#artist-statement")
          .and("have.attr", "id", "artist-statement-link")
          .and("have.class", "font-tangerine")
          .and("have.class", "text-text-muted")
          .and("have.class", "hover:text-focus")
          .and("have.class", "focus-visible:outline-none")
          .and("not.have.class", "underline")
          .and("not.have.class", "focus:underline");
        cy.contains("a", "Resume")
          .should("have.attr", "target", "_blank")
          .and("have.attr", "rel", "noopener")
          .and("have.class", "font-tangerine")
          .and("have.class", "text-text-muted")
          .and("have.class", "hover:text-focus")
          .and("have.class", "focus-visible:outline-none")
          .and("not.have.class", "underline")
          .and("not.have.class", "focus:underline");
      });
      cy.get('nav[aria-label="Portfolio documents"]')
        .should("have.class", "bottom-7")
        .and("have.class", "right-4")
        .and("have.class", "text-[28px]")
        .and("have.class", "items-end")
        .and("have.class", "flex-col")
        .and("have.class", "text-right")
        .and("have.class", "md:inset-x-0")
        .and(
          "have.class",
          "md:bottom-[max(0.25rem,env(safe-area-inset-bottom))]",
        )
        .and("have.class", "md:flex-row")
        .and("have.class", "lg:text-[36px]")
        .and("have.class", "md:justify-center")
        .and("not.have.class", "inset-0")
        .and("not.have.class", "items-center")
        .and("not.have.class", "left-4");
      cy.get('img[aria-hidden="true"]')
        .should("have.class", "max-w-none")
        .and("not.have.class", "max-w-[28vw]");
      cy.contains("Copyright @Avi Dixit 2026")
        .should("have.class", "font-footer")
        .and("have.class", "text-footer-copy")
        .and("have.class", "right-4")
        .and(
          "have.class",
          "md:right-[max(1rem,calc(env(safe-area-inset-right)+0.75rem))]",
        )
        .should("have.css", "font-size", "10px");
    });

    mount(
      <MotionProvider>
        <MemoryRouter initialEntries={["/contact"]}>
          <Footer landingEnabled />
        </MemoryRouter>
      </MotionProvider>,
    );
    cy.get('nav[aria-label="Portfolio documents"]').should("not.exist");
  });
});
