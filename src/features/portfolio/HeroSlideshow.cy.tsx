import { mount } from "@cypress/react";
import HeroSlideshow from "./HeroSlideshow";
import type { Photo } from "./photoCatalog";

const photos = [
  { id: "first", src: "/favicon.ico", alt: "First test photo" },
  { id: "second", src: "/favicon.ico", alt: "Second test photo" },
] as const satisfies readonly Photo[];

describe("HeroSlideshow", () => {
  it("rotates predictably and opens the active photo", () => {
    cy.clock();
    const onOpen = cy.spy().as("onOpen");

    mount(<HeroSlideshow photos={photos} onOpen={onOpen} />);

    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.tick(5001);
    cy.get('img[alt="Second test photo"]').should("have.class", "opacity-100");
    cy.get('[aria-label="Open hero image gallery"]').click();
    cy.get("@onOpen").should("have.been.calledOnceWith", 1);
  });

  it("clears its timer when unmounted", () => {
    cy.clock();
    cy.window().then((window) => cy.spy(window, "clearInterval").as("clear"));
    mount(<HeroSlideshow photos={photos} onOpen={cy.stub()} />);
    mount(<div>Replacement</div>);
    cy.get("@clear").should("have.been.calledOnce");
  });
});
