import { mount } from "@cypress/react";
import { useState } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { resolveFeatureAvailability } from "./featureAvailability";
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
    cy.get("nav span").should("have.class", "opacity-0");
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
    cy.get("nav span").should("have.class", "bg-brand-vivid");
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
