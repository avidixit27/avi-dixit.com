import { mount } from "@cypress/react";
import Lightbox from "./Lightbox";
import type { Photo } from "./photoCatalog";

const photos = [
  { id: "first", src: "/favicon.ico", alt: "First test photo" },
  { id: "portrait", src: "/favicon.ico", alt: "Portrait test photo" },
  { id: "last", src: "/favicon.ico", alt: "Last test photo" },
] as const satisfies readonly Photo[];

function pressKey(key: string) {
  cy.window().then((window) => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });
}

describe("Lightbox", () => {
  it("navigates eligible photos with buttons and arrow keys", () => {
    const onSelect = cy.spy().as("onSelect");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        landscapeIndices={[0, 2]}
        onSelect={onSelect}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[aria-label="Next image"]').click();
    cy.get("@onSelect").should("have.been.calledOnceWith", 2);
    pressKey("ArrowLeft");
    cy.get("@onSelect").should("have.been.calledWith", 2);
  });

  it("closes on Escape after the exit transition", () => {
    cy.clock();
    const onClosed = cy.spy().as("onClosed");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        landscapeIndices={[0, 2]}
        onSelect={cy.stub()}
        onClosed={onClosed}
      />,
    );

    pressKey("Escape");
    cy.get('[role="dialog"]').should("have.class", "opacity-0");
    cy.tick(150);
    cy.get("@onClosed").should("have.been.calledOnce");
  });

  it("removes keyboard listeners when unmounted", () => {
    const onSelect = cy.spy().as("onSelect");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        landscapeIndices={[0, 2]}
        onSelect={onSelect}
        onClosed={cy.stub()}
      />,
    );
    mount(<div>Replacement</div>);
    pressKey("ArrowRight");
    cy.get("@onSelect").should("not.have.been.called");
  });
});
