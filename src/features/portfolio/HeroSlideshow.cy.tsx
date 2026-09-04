import { mount } from "@cypress/react";
import HeroSlideshow from "./HeroSlideshow";
import type { Photo } from "./photoCatalog";

function createPhoto(id: string, alt: string): Photo {
  return {
    id,
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
      .and("have.attr", "fetchpriority", "high");
    cy.get('img[alt="Second test photo"]')
      .should("have.attr", "loading", "eager")
      .and("have.attr", "fetchpriority", "low");
    cy.get('img[alt="Third test photo"]').should("not.exist");
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.get("@rotationInterval").should("have.been.calledOnce");
    cy.tick(5001);
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.get('img[alt="Second test photo"]').trigger("load");
    cy.tick(5001);
    cy.get('img[alt="Second test photo"]').should("have.class", "opacity-100");
    cy.get('[aria-label="Open hero image gallery"]').click();
    cy.get("@onOpen").should(
      "have.been.calledOnceWith",
      1,
      Cypress.sinon.match(/second/),
    );
  });

  it("clears its timer when unmounted", () => {
    cy.clock();
    cy.window().then((window) => cy.spy(window, "clearInterval").as("clear"));
    mount(<HeroSlideshow photos={photos} onOpen={cy.stub()} />);
    mount(<div>Replacement</div>);
    cy.get("@clear").should("have.been.calledOnce");
  });
});
