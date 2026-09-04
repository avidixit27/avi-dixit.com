import { mount } from "@cypress/react";
import Lightbox from "./Lightbox";
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
  createPhoto("portrait", "Portrait test photo"),
  createPhoto("last", "Last test photo"),
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
        previewSrc="/first-preview.jpg"
        landscapeIndices={[0, 2]}
        onSelect={onSelect}
        onClosed={cy.stub()}
      />,
    );

    cy.get('img[alt="First test photo"]')
      .should("have.attr", "loading", "eager")
      .and("have.attr", "fetchpriority", "high")
      .and("have.attr", "decoding", "async")
      .and("have.attr", "sizes", "95vw");
    cy.get('[aria-label="Next image"]').click();
    cy.get("@onSelect").should("have.been.calledOnceWith", 2, "/last.jpg");
    pressKey("ArrowLeft");
    cy.get("@onSelect").should("have.been.calledWith", 2, "/last.jpg");
  });

  it("shows the clicked preview immediately and closes only from the backdrop", () => {
    cy.clock();
    const onClosed = cy.spy().as("onClosed");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/already-visible.jpg"
        landscapeIndices={[0, 2]}
        onSelect={cy.stub()}
        onClosed={onClosed}
      />,
    );

    cy.get('[data-lightbox-preview="true"]')
      .should("have.attr", "src", "/already-visible.jpg")
      .and("have.class", "opacity-100");
    cy.get('img[alt="First test photo"]')
      .should("have.class", "opacity-0")
      .trigger("load")
      .should("have.class", "opacity-100")
      .click();
    cy.get('[data-lightbox-preview="true"]').should("have.class", "opacity-0");
    cy.tick(150);
    cy.get("@onClosed").should("not.have.been.called");
    cy.get('[aria-label="Close photo viewer"]').click("topLeft");
    cy.tick(150);
    cy.get("@onClosed").should("have.been.calledOnce");
  });

  it("closes on Escape after the exit transition", () => {
    cy.clock();
    const onClosed = cy.spy().as("onClosed");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
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
        previewSrc="/first-preview.jpg"
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
