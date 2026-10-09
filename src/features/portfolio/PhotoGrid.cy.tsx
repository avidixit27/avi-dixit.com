import { mount } from "@cypress/react";
import PhotoGrid from "./PhotoGrid";
import { LIGHTBOX_IMAGE_SIZES } from "./portfolioPresentationPolicy";
import type { Photo } from "./photoTypes";

function photo(id: string, width: number, height: number): Photo {
  const source = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'/%3E`;

  return {
    id,
    sequence: Number(id),
    src: source,
    srcSet: source,
    sources: [],
    width,
    height,
    aspectRatio: width / height,
    alt: `Photo ${id}`,
  };
}

describe("PhotoGrid", () => {
  it("warms the lightbox-sized source on hover", () => {
    mount(
      <PhotoGrid
        photos={[photo("1", 6000, 4000), photo("2", 6000, 4000)]}
        onOpen={cy.stub()}
      />,
    );

    cy.get('img[alt="Photo 1"]')
      .should("have.attr", "fetchpriority", "low")
      .and("not.have.attr", "sizes", LIGHTBOX_IMAGE_SIZES);
    cy.get('[aria-label="Open Photo 1"]').trigger("pointerover", {
      pointerType: "mouse",
    });
    cy.get('img[alt="Photo 1"]')
      .should("have.attr", "fetchpriority", "low")
      .and("not.have.attr", "sizes", LIGHTBOX_IMAGE_SIZES);
    cy.get('[data-grid-lightbox-preload="true"] img')
      .should("have.attr", "sizes", LIGHTBOX_IMAGE_SIZES)
      .and("have.attr", "fetchpriority", "high");
    cy.get('img[alt="Photo 2"]')
      .should("have.attr", "fetchpriority", "low")
      .and("not.have.attr", "sizes", LIGHTBOX_IMAGE_SIZES);
  });

  it("packs the next landscape photo beside a preceding portrait photo", () => {
    cy.viewport(1280, 1000);
    mount(
      <PhotoGrid
        photos={[
          photo("1", 6000, 4000),
          photo("2", 4000, 6000),
          photo("3", 6000, 4000),
          photo("4", 6000, 4000),
        ]}
        onOpen={cy.stub()}
      />,
    );

    cy.get('[aria-label="Open Photo 2"]').then(($portrait) => {
      const portrait = $portrait.get(0).getBoundingClientRect();
      cy.get('[aria-label="Open Photo 4"]').should(($landscape) => {
        const landscape = $landscape.get(0).getBoundingClientRect();
        expect(landscape.top).to.be.lessThan(portrait.bottom);
      });
    });
  });
});
