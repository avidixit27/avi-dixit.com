import { mount } from "@cypress/react";
import { useState } from "react";
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

function StatefulLightbox({ onSelect }: { onSelect: () => void }) {
  const [selection, setSelection] = useState({
    index: 0,
    previewSrc: "/first-preview.jpg",
  });

  return (
    <Lightbox
      photos={photos}
      selectedIndex={selection.index}
      previewSrc={selection.previewSrc}
      landscapeIndices={[0, 2]}
      onSelect={(index, previewSrc) => {
        onSelect();
        setSelection({ index, previewSrc });
      }}
      onClosed={cy.stub()}
    />
  );
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
      .and("have.attr", "sizes", "95vw")
      .trigger("load")
      .should("have.class", "opacity-100");
    cy.get('[data-lightbox-stage="true"]').should(
      "have.attr",
      "aria-busy",
      "false",
    );
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

  it("keeps a stable stage while the larger image decodes", () => {
    cy.clock();
    let finishDecode: (() => void) | undefined;
    const decodePromise = new Promise<void>((resolve) => {
      finishDecode = resolve;
    });

    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        landscapeIndices={[0, 2]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[data-lightbox-stage="true"]')
      .should("have.attr", "aria-busy", "true")
      .should("have.css", "aspect-ratio", "6000 / 4000")
      .then(($stage) => {
        const initialRect = $stage.get(0)?.getBoundingClientRect();
        if (!initialRect) throw new Error("Expected a lightbox stage");

        cy.get('img[alt="First test photo"]').then(($image) => {
          const image = $image.get(0) as HTMLImageElement | undefined;
          if (!image) throw new Error("Expected a full lightbox image");
          cy.stub(image, "decode").returns(decodePromise);
          cy.wrap(image).trigger("load");
        });

        cy.get('[data-lightbox-preview="true"]').should(
          "have.class",
          "opacity-100",
        );
        cy.get('[data-lightbox-preview="true"]')
          .should("not.have.class", "blur-sm")
          .then(($preview) => {
            cy.get('img[alt="First test photo"]').then(($fullImage) => {
              const fullImage = $fullImage.get(0);
              const preview = $preview.get(0);
              expect(
                fullImage.compareDocumentPosition(preview) &
                  Node.DOCUMENT_POSITION_FOLLOWING,
              ).to.equal(Node.DOCUMENT_POSITION_FOLLOWING);
            });
          });
        cy.get('[aria-label="Next image"]')
          .should("not.be.disabled")
          .and("have.attr", "aria-disabled", "true")
          .and("not.have.class", "disabled:opacity-50");
        cy.get('img[alt="First test photo"]').should("have.class", "opacity-0");
        cy.then(() => finishDecode?.());
        cy.get('img[alt="First test photo"]')
          .should("have.class", "opacity-100")
          .and("not.have.class", "transition-opacity")
          .then(() => {
            const finalRect = $stage.get(0)?.getBoundingClientRect();
            expect(finalRect?.width).to.equal(initialRect.width);
            expect(finalRect?.height).to.equal(initialRect.height);
          });
        cy.get('[aria-label="Next image"]').should(
          "have.attr",
          "aria-disabled",
          "true",
        );
        cy.tick(300);
        cy.get('[data-lightbox-preview="true"]').should("not.exist");
        cy.get('[data-lightbox-stage="true"]').should(
          "have.attr",
          "aria-busy",
          "false",
        );
        cy.get('[aria-label="Next image"]').should(
          "have.attr",
          "aria-disabled",
          "false",
        );
      });
  });

  it("keeps the outgoing full-resolution frame until its replacement settles", () => {
    cy.clock();
    const onSelect = cy.spy().as("statefulOnSelect");
    let finishIncomingDecode: (() => void) | undefined;

    mount(<StatefulLightbox onSelect={onSelect} />);
    cy.get('img[alt="First test photo"]').then(($image) => {
      const image = $image.get(0) as HTMLImageElement | undefined;
      if (!image) throw new Error("Expected the initial full image");
      cy.stub(image, "decode").resolves();
      cy.wrap(image).trigger("load");
    });
    cy.get('img[alt="First test photo"]').should("have.class", "opacity-100");
    cy.tick(300);
    cy.get('[data-lightbox-stage="true"]').should(
      "have.attr",
      "aria-busy",
      "false",
    );

    cy.get('img[alt="First test photo"]').then(($image) => {
      const image = $image.get(0) as HTMLImageElement | undefined;
      if (!image) throw new Error("Expected the settled full image");
      const outgoingSrc = image.currentSrc || image.src;

      cy.get('[aria-label="Next image"]').click().click();
      cy.get("@statefulOnSelect").should("have.been.calledOnce");
      cy.get('[data-lightbox-outgoing="true"]')
        .should("have.attr", "src", outgoingSrc)
        .and("have.class", "opacity-100");
    });

    const incomingDecode = new Promise<void>((resolve) => {
      finishIncomingDecode = resolve;
    });
    cy.get('img[alt="Last test photo"]').then(($image) => {
      const image = $image.get(0) as HTMLImageElement | undefined;
      if (!image) throw new Error("Expected the incoming full image");
      cy.stub(image, "decode").returns(incomingDecode);
      cy.wrap(image).trigger("load");
    });
    cy.get('[data-lightbox-outgoing="true"]').should(
      "have.class",
      "opacity-100",
    );
    cy.then(() => finishIncomingDecode?.());
    cy.get('[data-lightbox-outgoing="true"]').should("have.class", "opacity-0");
    cy.tick(300);
    cy.get('[data-lightbox-outgoing="true"]').should("not.exist");
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
