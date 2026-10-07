import { mount } from "@cypress/react";
import PhotoGrid from "./PhotoGrid";
import type { Photo } from "./photoTypes";

const PIXEL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

function photo(id: string, width: number, height: number): Photo {
  return {
    id,
    sequence: Number(id),
    src: PIXEL,
    srcSet: PIXEL,
    sources: [],
    width,
    height,
    aspectRatio: width / height,
    alt: `Photo ${id}`,
  };
}

describe("PhotoGrid", () => {
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
