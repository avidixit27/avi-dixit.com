import { mount } from "@cypress/react";
import { useState } from "react";
import HeroSlideshow from "./HeroSlideshow";
import PortfolioExperience from "./PortfolioExperience";
import type { Photo } from "./photoCatalog";

function createPhoto(id: string, alt: string): Photo {
  return {
    id,
    sequence: 1,
    src: `/${id}.jpg`,
    srcSet: `/${id}-480.jpg 480w, /${id}-960.jpg 960w`,
    sources: [
      {
        type: "image/webp",
        srcSet: `/${id}-480.webp 480w, /${id}-960.webp 960w`,
      },
    ],
    width: 6000,
    height: 4000,
    aspectRatio: 1.5,
    alt,
  };
}

const photos = [
  createPhoto("first", "First test photo"),
  createPhoto("second", "Second test photo"),
  createPhoto("third", "Third test photo"),
] as const satisfies readonly Photo[];

describe("HeroSlideshow", () => {
  it("resets selection and the timer without replacing the loaded cover", () => {
    cy.clock();
    function ResettablePortfolio() {
      const [resetCount, setResetCount] = useState(0);
      return (
        <>
          <PortfolioExperience photos={photos} heroResetKey={`${resetCount}`} />
          <button
            type="button"
            className="relative z-10"
            onClick={() => setResetCount((count) => count + 1)}
          >
            Reset portfolio
          </button>
        </>
      );
    }

    mount(<ResettablePortfolio />);
    const hero = '[aria-label="Open hero image gallery"]';
    let coverElement: HTMLElement;
    cy.get(`${hero} img[alt="First test photo"]`).then(($image) => {
      coverElement = $image.get(0);
      coverElement.dispatchEvent(new Event("load"));
    });
    cy.get(`${hero} img[alt="Second test photo"]`).trigger("load");
    cy.tick(2000);
    cy.contains("button", "Reset portfolio").click();
    cy.get(`${hero} img[alt="First test photo"]`)
      .should(($image) => expect($image.get(0)).to.equal(coverElement))
      .parent()
      .should("not.have.class", "image-skeleton");
    cy.tick(2499);
    cy.get(`${hero} img[alt="First test photo"]`).should(
      "have.class",
      "opacity-100",
    );
    cy.tick(1);
    cy.get(`${hero} img[alt="Second test photo"]`).should(
      "have.class",
      "opacity-100",
    );
    cy.contains("button", "Reset portfolio").click();
    cy.get(`${hero} img[alt="First test photo"]`)
      .should("have.class", "opacity-100")
      .should(($image) => expect($image.get(0)).to.equal(coverElement));
    cy.tick(2499);
    cy.get(`${hero} img[alt="First test photo"]`).should(
      "have.class",
      "opacity-100",
    );
    cy.tick(1);
    cy.get(`${hero} img[alt="Second test photo"]`).should(
      "have.class",
      "opacity-100",
    );
  });

  it("rotates predictably and opens the active photo", () => {
    cy.clock();
    cy.window().then((window) =>
      cy.spy(window, "setInterval").as("rotationInterval"),
    );
    const onOpen = cy.spy().as("onOpen");

    mount(<HeroSlideshow photos={photos} onOpen={onOpen} />);

    cy.get("img").should("have.length", 2);
    cy.get('img[alt="First test photo"]')
      .should("have.attr", "loading", "eager")
      .and("have.attr", "fetchpriority", "high")
      .and("have.css", "transition-duration", "0.7s");
    cy.get('img[alt="Second test photo"]')
      .should("have.attr", "loading", "eager")
      .and("have.attr", "fetchpriority", "low");
    cy.get('img[alt="Third test photo"]').should("not.exist");
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.get("@rotationInterval").should("have.been.calledOnce");
    cy.tick(2501);
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.get('img[alt="Second test photo"]').trigger("load");
    cy.tick(2501);
    cy.get("img").should("have.length", 3);
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-0");
    cy.get('img[alt="Second test photo"]').should("have.class", "opacity-100");
    cy.tick(701);
    cy.get('img[alt="First test photo"]').should("not.exist");
    cy.get('[aria-label="Open hero image gallery"]').click();
    cy.get("@onOpen").should(
      "have.been.calledOnceWith",
      1,
      Cypress.sinon.match(/second/),
    );
  });

  it("clears its timer when unmounted", () => {
    cy.clock();
    cy.window().then((window) => {
      cy.spy(window, "setInterval").as("setInterval");
      cy.spy(window, "clearInterval").as("clearInterval");
    });
    mount(<HeroSlideshow photos={photos} onOpen={cy.stub()} />);
    cy.get("@setInterval").should("have.been.calledOnce");
    mount(<div>Replacement</div>);
    cy.get("@clearInterval").should("have.been.calledOnce");
  });

  it("restarts from the first photo when remounted for a selection", () => {
    cy.clock();

    function ResettableSlideshow() {
      const [resetKey, setResetKey] = useState("initial");

      return (
        <>
          <HeroSlideshow key={resetKey} photos={photos} onOpen={cy.stub()} />
          <button
            type="button"
            className="relative z-10"
            onClick={() => setResetKey("selected-again")}
          >
            Reset slideshow
          </button>
        </>
      );
    }

    mount(<ResettableSlideshow />);
    cy.get('img[alt="Second test photo"]').trigger("load");
    cy.tick(2501);
    cy.get('img[alt="Second test photo"]').should("have.class", "opacity-100");

    cy.contains("button", "Reset slideshow").click();
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.get('img[alt="Second test photo"]').trigger("load");
    cy.tick(2499);
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.tick(1);
    cy.get('img[alt="Second test photo"]').should("have.class", "opacity-100");
  });

  it("starts a portrait viewport on its configured cover", () => {
    cy.clock();
    cy.viewport(390, 844);

    mount(
      <HeroSlideshow
        photos={photos}
        initialPhotoIdsByOrientation={{
          landscape: "first",
          portrait: "third",
        }}
        onOpen={cy.stub()}
      />,
    );

    cy.get('img[alt="Third test photo"]').should("have.class", "opacity-100");
    cy.get('img[alt="First test photo"]').trigger("load");
    cy.tick(2499);
    cy.get('img[alt="Third test photo"]').should("have.class", "opacity-100");
    cy.tick(1);
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
  });
});
