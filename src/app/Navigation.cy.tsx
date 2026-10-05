import { mount } from "@cypress/react";
import { useState } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { resolveFeatureAvailability } from "./featureAvailability";
import MotionProvider from "./MotionProvider";
import Navigation from "./Navigation";

const allFeatures = resolveFeatureAvailability({ shop: true, contact: true });

function LocationKey() {
  const location = useLocation();

  return <output>{location.key}</output>;
}

function LocationPath() {
  const location = useLocation();

  return <output data-location>{location.pathname}</output>;
}

function NavigationAvailabilityHarness() {
  const [availability, setAvailability] = useState(allFeatures);

  return (
    <>
      <button
        type="button"
        className="fixed right-0 bottom-0"
        onClick={() =>
          setAvailability(
            resolveFeatureAvailability({ shop: false, contact: true }),
          )
        }
      >
        Hide Shop
      </button>
      <Navigation availability={availability} portfolioGridElement={null} />
    </>
  );
}

describe("Navigation", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  it("shows only released destinations and clears a disabled active link", () => {
    mount(
      <MemoryRouter initialEntries={["/SHOP/"]}>
        <NavigationAvailabilityHarness />
      </MemoryRouter>,
    );

    cy.contains("a", "HOME").should("be.visible");
    cy.contains("a", "SHOP").should("be.visible");
    cy.contains("a", "CONTACT").should("be.visible");

    cy.contains("button", "Hide Shop").click();
    cy.contains("a", "SHOP").should("not.exist");
    cy.contains("a", "CONTACT").should("be.visible");
    cy.get('[data-navigation-indicator="true"]').should(
      "have.class",
      "opacity-0",
    );
  });

  it("renders route links and marks the current destination", () => {
    mount(
      <MemoryRouter initialEntries={["/SHOP/"]}>
        <Navigation availability={allFeatures} portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.contains("a", "HOME").should("have.attr", "href", "/");
    cy.contains("a", "SHOP")
      .should("have.attr", "href", "/shop")
      .and("have.class", "text-brand-warm")
      .and("not.have.class", "font-bold");
    cy.get('[data-navigation-indicator="true"]').should(
      "have.class",
      "bg-brand-vivid",
    );
    cy.contains("a", "CONTACT").should("have.attr", "href", "/contact");
  });

  it("uses the project display-font token for navigation labels", () => {
    mount(
      <MemoryRouter>
        <Navigation availability={allFeatures} portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.contains("a", "SHOP")
      .should("have.class", "font-display")
      .and("not.have.class", "font-bold");
  });

  it("keeps the portrait and wordmark centered in the navigation row", () => {
    mount(
      <MemoryRouter>
        <Navigation availability={allFeatures} portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.get('a[aria-label="Home"]')
      .find("img")
      .should("have.length", 2)
      .first()
      .should("have.class", "h-12")
      .and("have.class", "md:h-14")
      .then(($portrait) => {
        const portrait = $portrait.get(0);
        const navigation = portrait?.closest("nav");
        if (!portrait || !navigation) {
          throw new Error("Expected the navigation portrait");
        }

        const portraitCenter =
          portrait.getBoundingClientRect().top +
          portrait.getBoundingClientRect().height / 2;
        const navigationCenter =
          navigation.getBoundingClientRect().top +
          navigation.getBoundingClientRect().height / 2;
        expect(Math.abs(portraitCenter - navigationCenter)).to.be.lessThan(1);
      });
  });

  it("keeps the approved 32px gap between adjacent navigation labels", () => {
    cy.viewport(1280, 800);
    mount(
      <MemoryRouter>
        <Navigation availability={allFeatures} portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.get('[data-desktop-navigation="true"]').within(() => {
      cy.contains("a", "HOME").then(($home) => {
        cy.contains("a", "CONTACT").then(($contact) => {
          cy.contains("a", "SHOP").then(($shop) => {
            const home = $home.get(0);
            const contact = $contact.get(0);
            const shop = $shop.get(0);
            if (!home || !shop || !contact) {
              throw new Error("Expected each navigation link");
            }

            const homeRect = home.getBoundingClientRect();
            const contactRect = contact.getBoundingClientRect();
            const shopRect = shop.getBoundingClientRect();
            const homeToContactGap = contactRect.left - homeRect.right;
            const contactToShopGap = shopRect.left - contactRect.right;

            expect(homeToContactGap).to.equal(32);
            expect(contactToShopGap).to.equal(32);
          });
        });
      });
    });
  });

  it("lists secondary portfolios in the right-aligned desktop dropdown", () => {
    cy.clock();
    cy.viewport(1280, 800);
    mount(
      <MemoryRouter>
        <MotionProvider>
          <Navigation availability={allFeatures} portfolioGridElement={null} />
        </MotionProvider>
      </MemoryRouter>,
    );

    cy.get('[data-desktop-navigation="true"] button')
      .contains("PORTFOLIOS")
      .click();
    cy.tick(500);
    cy.get('[data-desktop-navigation="true"] nav[aria-label="Portfolios"]')
      .should("be.visible")
      .and("have.class", "left-1/2")
      .and("have.class", "w-max")
      .and("have.class", "bg-[#4A4A4A]")
      .and("have.class", "border-t-border")
      .and("have.class", "border-l-canvas")
      .within(() => {
        cy.contains("a", "paris").should(
          "have.attr",
          "href",
          "/portfolio/paris-fr",
        );
        cy.contains("a", "kerala").should(
          "have.attr",
          "href",
          "/portfolio/kerala",
        );
        cy.contains("a", "entropy, chaos").should("not.exist");
      });
    cy.get(
      '[data-desktop-navigation="true"] nav[aria-label="Portfolios"]',
    ).then(($menu) => {
      const menuRect = $menu.get(0)?.getBoundingClientRect();
      if (!menuRect) throw new Error("Expected the portfolio menu");

      cy.contains("button", "PORTFOLIOS").then(($button) => {
        const buttonRect = $button.get(0)?.getBoundingClientRect();
        if (!buttonRect) throw new Error("Expected the portfolio button");
        expect(
          Math.abs(
            menuRect.left +
              menuRect.width / 2 -
              (buttonRect.left + buttonRect.width / 2),
          ),
        ).to.be.lessThan(1);
      });

      const menuStyle = getComputedStyle($menu.get(0));
      expect(menuStyle.backgroundColor).to.equal("rgb(74, 74, 74)");
      expect(menuStyle.borderTopColor).to.equal("rgb(60, 57, 52)");
      expect(menuStyle.borderLeftColor).to.equal("rgb(14, 14, 14)");

      cy.wrap($menu)
        .find("a")
        .then(($links) => {
          const linkRects = [...$links].map((link) =>
            link.getBoundingClientRect(),
          );
          const widestLink = Math.max(
            ...linkRects.map((linkRect) => linkRect.width),
          );
          const firstLink = linkRects[0];
          if (!firstLink) throw new Error("Expected a portfolio link");

          expect(menuRect.width - widestLink).to.be.within(41, 43);
          expect(menuRect.right - firstLink.right).to.be.within(20, 22);
          expect(firstLink.top - menuRect.top).to.be.within(5, 13);
        });
    });
    cy.tick(2000);
    cy.get('[data-desktop-navigation="true"]')
      .closest("nav")
      .should("have.class", "translate-y-0");
  });

  it("collapses navigation and portfolios into the mobile hamburger", () => {
    cy.clock();
    cy.viewport(390, 844);
    mount(
      <MemoryRouter>
        <MotionProvider>
          <Navigation availability={allFeatures} portfolioGridElement={null} />
        </MotionProvider>
      </MemoryRouter>,
    );

    cy.get('[data-desktop-navigation="true"]').should("not.be.visible");
    cy.get('button[aria-label="Navigation menu"]')
      .click()
      .should("have.attr", "aria-expanded", "true");
    cy.tick(500);
    cy.get("#mobile-navigation-menu").should(($menu) => {
      expect(getComputedStyle($menu.get(0)).clipPath).not.to.contain("100%");
    });
    cy.get('[data-mobile-navigation="true"]').within(() => {
      cy.contains("a", "HOME").should("be.visible");
      cy.contains("a", "CONTACT").should("be.visible");
      cy.contains("button", "PORTFOLIOS").click();
      cy.tick(500);
      cy.get('nav[aria-label="Portfolios"]').within(() => {
        cy.contains("a", "paris").should("be.visible");
        cy.contains("a", "kerala").should("be.visible");
      });
    });
  });

  it("folds the desktop portfolio menu away after clicking outside it", () => {
    cy.viewport(1280, 800);
    mount(
      <MemoryRouter>
        <MotionProvider>
          <Navigation availability={allFeatures} portfolioGridElement={null} />
        </MotionProvider>
      </MemoryRouter>,
    );

    cy.contains("button", "PORTFOLIOS").click();
    cy.get('nav[aria-label="Portfolios"]').should("be.visible");
    cy.get("body").click(10, 300);
    cy.contains("button", "PORTFOLIOS").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.get('nav[aria-label="Portfolios"]').should("not.exist");
  });

  it("finishes folding the portfolio menu before changing projects", () => {
    cy.clock();
    mount(
      <MemoryRouter>
        <MotionProvider>
          <Navigation availability={allFeatures} portfolioGridElement={null} />
          <LocationPath />
        </MotionProvider>
      </MemoryRouter>,
    );

    cy.contains("button", "PORTFOLIOS").click();
    cy.tick(500);
    cy.contains('nav[aria-label="Portfolios"] a', "paris").click();
    cy.get("output[data-location]").should("have.text", "/");
    cy.tick(449);
    cy.get("output[data-location]").should("have.text", "/");
    cy.tick(1);
    cy.get("output[data-location]").should("have.text", "/portfolio/paris-fr");
  });

  it("uses the Home portfolio visibility behavior on project routes", () => {
    cy.clock();
    mount(
      <MemoryRouter initialEntries={["/portfolio/paris-fr"]}>
        <Navigation availability={allFeatures} portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.get("nav").should("have.class", "translate-y-0");
    cy.tick(2000);
    cy.get("nav").should("have.class", "-translate-y-full");
    cy.window().trigger("mousemove");
    cy.get("nav").should("have.class", "translate-y-0");
  });

  it("runs a controlled return to the top without remounting Home", () => {
    const onHomeResetEnd = cy.stub().as("onHomeResetEnd");
    const onHomeResetStart = cy.stub().as("onHomeResetStart");

    let homeResetFrame: FrameRequestCallback | undefined;
    cy.window().then((window) => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 1200,
      });
      cy.stub(window.performance, "now").returns(100);
      cy.stub(window, "requestAnimationFrame").callsFake((callback) => {
        homeResetFrame = callback;
        return 1;
      });
      cy.stub(window, "scrollTo").as("scrollTo");
      cy.stub(window, "matchMedia").returns({
        matches: false,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
      } as unknown as MediaQueryList);
    });
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation
          availability={allFeatures}
          portfolioGridElement={null}
          onHomeResetEnd={onHomeResetEnd}
          onHomeResetStart={onHomeResetStart}
        />
        <LocationKey />
      </MemoryRouter>,
    );

    cy.get("output").invoke("text").as("initialLocationKey");
    cy.get('a[aria-label="Home"]').click().should("not.have.focus");
    cy.get("@onHomeResetStart").should("have.been.calledOnce");
    cy.get("@scrollTo").should("not.have.been.called");
    cy.then(() => {
      expect(homeResetFrame).to.be.a("function");
      homeResetFrame?.(1000);
    });
    cy.get("@scrollTo").should("have.been.calledOnceWith", 0, 0);
    cy.get("@initialLocationKey").then((initialLocationKey) => {
      cy.get("output").should("have.text", initialLocationKey);
    });
    cy.get("@onHomeResetEnd").should("have.been.calledOnce");
  });

  it("returns Home to the top immediately when motion is reduced", () => {
    cy.window().then((window) => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 1200,
      });
      cy.stub(window, "scrollTo").as("scrollTo");
      cy.stub(window, "matchMedia").returns({
        matches: true,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
      } as unknown as MediaQueryList);
    });
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation availability={allFeatures} portfolioGridElement={null} />
      </MemoryRouter>,
    );

    cy.contains("a", "HOME").click();
    cy.get("@scrollTo").should("have.been.calledOnceWith", 0, 0);
  });

  it("cancels an active Home reset before navigating away", () => {
    const onHomeResetEnd = cy.stub().as("onHomeResetEnd");

    cy.window().then((window) => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 1200,
      });
      cy.stub(window.performance, "now").returns(100);
      cy.stub(window, "requestAnimationFrame")
        .onFirstCall()
        .returns(1)
        .onSecondCall()
        .returns(42);
      cy.stub(window, "cancelAnimationFrame").as("cancelAnimationFrame");
      cy.stub(window, "matchMedia").returns({
        matches: false,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
      } as unknown as MediaQueryList);
    });
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation
          availability={allFeatures}
          portfolioGridElement={null}
          onHomeResetEnd={onHomeResetEnd}
        />
        <LocationPath />
      </MemoryRouter>,
    );

    cy.get('a[aria-label="Home"]').click();
    cy.contains("a", "SHOP").click();

    cy.get("@cancelAnimationFrame").then((cancelAnimationFrame) => {
      expect(
        cancelAnimationFrame
          .getCalls()
          .filter((call: sinon.SinonSpyCall) => call.args[0] === 42),
      ).to.have.length(1);
    });
    cy.get("@onHomeResetEnd").should("have.been.calledOnce");
    cy.get("output[data-location]").should("have.text", "/shop");
  });

  it("preserves modified Home link activation", () => {
    const onHomeResetStart = cy.stub().as("onHomeResetStart");

    cy.window().then((window) => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 1200,
      });
      cy.stub(window, "scrollTo").as("scrollTo");
    });
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation
          availability={allFeatures}
          portfolioGridElement={null}
          onHomeResetStart={onHomeResetStart}
        />
      </MemoryRouter>,
    );

    cy.get('a[aria-label="Home"]').trigger("click", { ctrlKey: true });

    cy.get("@onHomeResetStart").should("not.have.been.called");
    cy.get("@scrollTo").should("not.have.been.called");
  });

  it("keeps an active Home reset for a modified non-Home link activation", () => {
    const onHomeResetEnd = cy.stub().as("onHomeResetEnd");

    cy.window().then((window) => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 1200,
      });
      cy.stub(window.performance, "now").returns(100);
      cy.stub(window, "requestAnimationFrame")
        .onFirstCall()
        .returns(1)
        .onSecondCall()
        .returns(42);
      cy.stub(window, "cancelAnimationFrame").as("cancelAnimationFrame");
      cy.stub(window, "matchMedia").returns({
        matches: false,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
      } as unknown as MediaQueryList);
    });
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation
          availability={allFeatures}
          portfolioGridElement={null}
          onHomeResetEnd={onHomeResetEnd}
        />
        <LocationPath />
      </MemoryRouter>,
    );

    cy.get('a[aria-label="Home"]').click();
    cy.contains("a", "SHOP").trigger("click", { ctrlKey: true });

    cy.get("@cancelAnimationFrame").then((cancelAnimationFrame) => {
      expect(
        cancelAnimationFrame
          .getCalls()
          .filter((call: sinon.SinonSpyCall) => call.args[0] === 42),
      ).to.have.length(0);
    });
    cy.get("@onHomeResetEnd").should("not.have.been.called");
    cy.get("output[data-location]").should("have.text", "/");
  });

  it("does not retain a canceled reset handle after motion becomes reduced", () => {
    const onHomeResetEnd = cy.stub().as("onHomeResetEnd");

    cy.window().then((window) => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 1200,
      });
      cy.stub(window.performance, "now").returns(100);
      cy.stub(window, "requestAnimationFrame")
        .onFirstCall()
        .returns(1)
        .onSecondCall()
        .returns(42);
      cy.stub(window, "cancelAnimationFrame").as("cancelAnimationFrame");
      cy.stub(window, "scrollTo");
      cy.stub(window, "matchMedia")
        .onFirstCall()
        .returns({
          matches: false,
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
        } as unknown as MediaQueryList)
        .onSecondCall()
        .returns({
          matches: true,
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
        } as unknown as MediaQueryList);
    });
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation
          availability={allFeatures}
          portfolioGridElement={null}
          onHomeResetEnd={onHomeResetEnd}
        />
        <LocationPath />
      </MemoryRouter>,
    );

    cy.get('a[aria-label="Home"]').click().click();
    cy.contains("a", "SHOP").click();

    cy.get("@cancelAnimationFrame").then((cancelAnimationFrame) => {
      expect(
        cancelAnimationFrame
          .getCalls()
          .filter((call: sinon.SinonSpyCall) => call.args[0] === 42),
      ).to.have.length(1);
    });
    cy.get("@onHomeResetEnd").should("have.been.calledOnce");
    cy.get("output[data-location]").should("have.text", "/shop");
  });
});
