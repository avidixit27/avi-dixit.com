import { mount } from "@cypress/react";
import { useState } from "react";
import Lightbox from "./Lightbox";
import type { Photo } from "./photoCatalog";
import {
  LIGHTBOX_CLOSE_DURATION_MS,
  LIGHTBOX_IMAGE_TRANSITION_MS,
} from "./portfolioPresentationPolicy";

function createPhoto(
  id: string,
  alt: string,
  sequence: number,
  width = 6000,
  height = 4000,
): Photo {
  return {
    id,
    sequence,
    src: `/${id}.jpg`,
    srcSet: `/${id}-480.jpg 480w, /${id}-960.jpg 960w`,
    sources: [
      {
        type: "image/avif",
        srcSet: `/${id}-480.avif 480w, /${id}-960.avif 960w`,
      },
      {
        type: "image/webp",
        srcSet: `/${id}-480.webp 480w, /${id}-960.webp 960w`,
      },
    ],
    width,
    height,
    aspectRatio: width / height,
    alt,
  };
}

const photos = [
  createPhoto("first", "First test photo", 1),
  createPhoto("portrait", "Portrait test photo", 2, 4000, 6000),
  createPhoto("last", "Last test photo", 3),
] as const satisfies readonly Photo[];

function pressKey(key: string) {
  cy.window().then((window) => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });
}

function StatefulLightbox({
  onSelect,
  navigationIndices = [0, 2],
}: {
  onSelect: (index: number, previewSrc: string) => void;
  navigationIndices?: readonly number[];
}) {
  const [selection, setSelection] = useState({
    index: 0,
    previewSrc: "/first-preview.jpg",
  });

  return (
    <Lightbox
      photos={photos}
      selectedIndex={selection.index}
      previewSrc={selection.previewSrc}
      navigationIndices={navigationIndices}
      onSelect={(index, previewSrc) => {
        onSelect(index, previewSrc);
        setSelection({ index, previewSrc });
      }}
      onClosed={cy.stub()}
    />
  );
}

describe("Lightbox", () => {
  it("shows the filename sequence number in the viewer's top-left corner", () => {
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={2}
        previewSrc="/last-preview.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[data-lightbox-photo-number="true"]')
      .should("have.text", "3")
      .and("have.attr", "aria-label", "Photo 3 of 3")
      .and("have.css", "font-size", "52px")
      .and("have.css", "color", "rgb(253, 113, 0)");
    cy.get('[data-lightbox-controls="true"]').should(
      "have.css",
      "position",
      "fixed",
    );
  });

  it("can omit photo numbering without moving the close control", () => {
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        navigationIndices={[0, 1, 2]}
        showPhotoNumber={false}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[data-lightbox-photo-number="true"]').should("not.exist");
    cy.get('[data-lightbox-controls="true"]')
      .should("have.class", "justify-end")
      .find('[aria-label="Close"]')
      .should("be.visible");
  });

  it("keeps the close control accessible on a small viewport", () => {
    cy.viewport(390, 844);
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[aria-label="Close"]').then(($button) => {
      const button = $button.get(0);
      if (!button) throw new Error("Expected a close control");
      const buttonRect = button.getBoundingClientRect();
      expect(buttonRect.width).to.be.at.least(44);
      expect(buttonRect.height).to.be.at.least(44);

      expect(getComputedStyle(button).zIndex).to.equal("200");
    });
  });

  it("keeps a two-digit photo number clear of close at narrow widths", () => {
    cy.viewport(80, 600);
    mount(
      <Lightbox
        photos={[createPhoto("twelfth", "Twelfth test photo", 12)]}
        selectedIndex={0}
        previewSrc="/twelfth-preview.jpg"
        navigationIndices={[]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.document().then((document) => document.fonts.ready);
    cy.get('[data-lightbox-photo-number="true"]').then(($number) => {
      const number = $number.get(0)?.getBoundingClientRect();
      if (!number) throw new Error("Expected the photo number");
      cy.get('[aria-label="Close"]').then(($button) => {
        const button = $button.get(0)?.getBoundingClientRect();
        if (!button) throw new Error("Expected the close button");
        expect(number.right).to.be.lessThan(button.left);
      });
    });
  });

  it("includes portrait photos against the black viewer canvas", () => {
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={1}
        previewSrc="/portrait-preview.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[role="dialog"]').should(
      "have.css",
      "background-color",
      "rgb(14, 14, 14)",
    );
    cy.get('[data-lightbox-stage="true"]')
      .should("have.attr", "style")
      .and("include", "width: 95vw")
      .and("include", "height: 95vh")
      .and("not.include", "aspect-ratio");
    cy.get('img[alt="Portrait test photo"]')
      .should("have.class", "object-contain")
      .and("have.class", "absolute")
      .and("have.class", "max-h-full")
      .and("have.class", "max-w-full")
      .and("have.class", "h-auto")
      .and("have.class", "w-auto");
  });

  it("gives the close control an accessible warm-orange fill interaction", () => {
    const onViewerFade = cy.spy().as("onViewerFade");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[aria-label="Close"]')
      .should("have.class", "lightbox-close-button")
      .find(".lightbox-close-stroke")
      .should("have.length", 2)
      .first()
      .should("have.css", "background-image")
      .and("include", "rgb(253, 113, 0)");
    cy.get('[role="dialog"]').should(
      "have.css",
      "transition-duration",
      "0.18s",
    );
    cy.get(".lightbox-close-stroke")
      .first()
      .should("have.css", "background-size", "200% 100%")
      .and("have.css", "background-position", "100% 50%");
    cy.get(".lightbox-close-stroke")
      .last()
      .should("have.css", "background-position", "0% 50%");

    cy.get('[role="dialog"]')
      .should("have.css", "opacity", "1")
      .then(($dialog) => {
        const dialog = $dialog.get(0);
        if (!dialog) throw new Error("Expected the photo viewer");
        dialog.addEventListener("transitionstart", (event) => {
          if (event.target !== dialog || event.propertyName !== "opacity")
            return;
          const close = dialog.querySelector('[aria-label="Close"]');
          if (!close) throw new Error("Expected the close control");
          onViewerFade(getComputedStyle(close).opacity);
        });
      });

    cy.get('[aria-label="Close"]')
      .click()
      .should("have.attr", "data-closing", "true");
    cy.get('[role="dialog"]')
      .should("have.css", "--lightbox-close-fold-duration", "200ms")
      .and("have.css", "transition-delay", "0.2s")
      .and("have.css", "transition-duration", "0.1s");
    cy.get("@onViewerFade").should("have.been.calledOnceWith", "0");
    cy.get(".lightbox-close-stroke").each(($stroke) => {
      cy.wrap($stroke).should(
        "have.css",
        "transform",
        "matrix(1, 0, 0, 1, 0, 0)",
      );
    });
  });

  it("preloads and decodes a bounded responsive navigation window", () => {
    const preloadPhotos = Array.from({ length: 6 }, (_, index) =>
      createPhoto(`preload-${index}`, `Preload photo ${index}`, index + 1),
    );

    mount(
      <Lightbox
        photos={preloadPhotos}
        selectedIndex={0}
        previewSrc="/preload-preview.jpg"
        navigationIndices={[0, 1, 2, 3, 4, 5]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[data-lightbox-preload="true"]').should("have.length", 5);
    cy.get('[data-lightbox-preload="true"] source[type="image/avif"]')
      .should("have.length", 5)
      .each(($source) =>
        expect($source.attr("srcset")).to.match(/\.avif 480w, .*\.avif 960w/),
      );
    cy.get('[data-lightbox-preload="true"] img').each(($image) => {
      expect($image.attr("sizes")).to.equal("95vw");
      expect($image.prop("fetchPriority")).to.equal("low");
      expect($image.attr("srcset")).to.match(/\.jpg 480w, .*\.jpg 960w/);
    });
  });

  it("navigates eligible photos with buttons and arrow keys", () => {
    const onSelect = cy.spy().as("onSelect");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        navigationIndices={[0, 1, 2]}
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
    cy.get("@onSelect").should("have.been.calledOnceWith", 1, "/portrait.jpg");
    pressKey("ArrowLeft");
    cy.get("@onSelect").should("have.been.calledWith", 1, "/portrait.jpg");
  });

  it("shows the clicked preview immediately and closes only from the backdrop", () => {
    cy.clock();
    const onClosed = cy.spy().as("onClosed");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/already-visible.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={onClosed}
      />,
    );

    cy.get('[data-lightbox-preview="true"]')
      .should("have.attr", "src", "/already-visible.jpg")
      .and("have.class", "opacity-100")
      .and(
        "have.css",
        "transition-duration",
        `${LIGHTBOX_IMAGE_TRANSITION_MS / 1000}s`,
      );
    cy.get('img[alt="First test photo"]')
      .should("have.class", "opacity-0")
      .trigger("load")
      .should("have.class", "opacity-100")
      .click();
    cy.get('[data-lightbox-preview="true"]').should("have.class", "opacity-0");
    cy.tick(LIGHTBOX_CLOSE_DURATION_MS);
    cy.get("@onClosed").should("not.have.been.called");
    cy.get('[aria-label="Close photo viewer"]').click("topLeft");
    cy.tick(LIGHTBOX_CLOSE_DURATION_MS - 1);
    cy.get("@onClosed").should("not.have.been.called");
    cy.tick(1);
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
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={cy.stub()}
      />,
    );

    cy.get('[data-lightbox-stage="true"]')
      .should("have.attr", "aria-busy", "true")
      .should("have.attr", "style")
      .and("include", "width: 95vw")
      .and("include", "height: 95vh");
    cy.get('[data-lightbox-stage="true"]').then(($stage) => {
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
        .and("not.have.attr", "aria-disabled");
      cy.get('[aria-label="Next image"]').should(
        "not.have.class",
        "disabled:opacity-50",
      );
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
        "not.have.attr",
        "aria-disabled",
      );
      cy.tick(250);
      cy.get('[data-lightbox-preview="true"]').should("not.exist");
      cy.get('[data-lightbox-stage="true"]').should(
        "have.attr",
        "aria-busy",
        "false",
      );
      cy.get('[aria-label="Next image"]').should(
        "not.have.attr",
        "aria-disabled",
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
    cy.tick(250);
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
      cy.get("@statefulOnSelect").should(
        "have.been.calledOnceWith",
        2,
        "/last.jpg",
      );
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
    cy.tick(250);
    cy.get("@statefulOnSelect").should("have.been.calledWith", 0, "/first.jpg");
    cy.get("@statefulOnSelect").should("have.been.calledTwice");
  });

  it("preserves outgoing dimensions while entering a portrait photo", () => {
    const onSelect = cy.spy().as("portraitOnSelect");

    mount(
      <StatefulLightbox onSelect={onSelect} navigationIndices={[0, 1, 2]} />,
    );
    cy.get('img[alt="First test photo"]').then(($image) => {
      const image = $image.get(0) as HTMLImageElement | undefined;
      if (!image) throw new Error("Expected the initial full image");
      cy.stub(image, "decode").resolves();
      cy.wrap(image).trigger("load");
    });
    cy.get('[data-lightbox-stage="true"]').should(
      "have.attr",
      "aria-busy",
      "false",
    );

    cy.get('[aria-label="Next image"]').click();
    cy.get("@portraitOnSelect").should(
      "have.been.calledOnceWith",
      1,
      "/portrait.jpg",
    );
    cy.get('[data-lightbox-outgoing="true"]')
      .should("have.attr", "width", "6000")
      .and("have.attr", "height", "4000");
    cy.get('img[alt="Portrait test photo"]')
      .should("have.attr", "width", "4000")
      .and("have.attr", "height", "6000");
  });

  it("preserves portrait dimensions while returning to landscape", () => {
    const onSelect = cy.spy().as("landscapeOnSelect");

    mount(
      <StatefulLightbox onSelect={onSelect} navigationIndices={[0, 1, 2]} />,
    );
    cy.get('img[alt="First test photo"]').then(($image) => {
      const image = $image.get(0) as HTMLImageElement | undefined;
      if (!image) throw new Error("Expected the initial full image");
      cy.stub(image, "decode").resolves();
      cy.wrap(image).trigger("load");
    });
    cy.get('[data-lightbox-stage="true"]').should(
      "have.attr",
      "aria-busy",
      "false",
    );
    cy.get('[aria-label="Next image"]').click();
    cy.get('img[alt="Portrait test photo"]').then(($image) => {
      const image = $image.get(0) as HTMLImageElement | undefined;
      if (!image) throw new Error("Expected the portrait full image");
      cy.stub(image, "decode").resolves();
      cy.wrap(image).trigger("load");
    });
    cy.get('[data-lightbox-stage="true"]').should(
      "have.attr",
      "aria-busy",
      "false",
    );

    cy.get('[aria-label="Next image"]').click();
    cy.get("@landscapeOnSelect").should("have.been.calledWith", 2, "/last.jpg");
    cy.get('[data-lightbox-outgoing="true"]')
      .should("have.attr", "width", "4000")
      .and("have.attr", "height", "6000")
      .and(
        "have.css",
        "transition-duration",
        `${LIGHTBOX_IMAGE_TRANSITION_MS / 1000}s`,
      );
    cy.get('img[alt="Last test photo"]')
      .should("have.attr", "width", "6000")
      .and("have.attr", "height", "4000");
  });

  it("closes on Escape after the exit transition", () => {
    cy.clock();
    const onClosed = cy.spy().as("onClosed");
    cy.window().then((window) =>
      cy.spy(window, "addEventListener").as("addEventListener"),
    );
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={onClosed}
      />,
    );

    cy.get("@addEventListener").should("have.been.calledWith", "keydown");
    pressKey("Escape");
    cy.get('[role="dialog"]').should("have.class", "opacity-100");
    cy.tick(LIGHTBOX_CLOSE_DURATION_MS);
    cy.get("@onClosed").should("have.been.calledOnce");
  });

  it("closes immediately when reduced motion is preferred", () => {
    const onClosed = cy.spy().as("onClosed");
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={cy.stub()}
        onClosed={onClosed}
      />,
    );

    cy.window().then((window) => {
      cy.stub(window, "matchMedia")
        .withArgs("(prefers-reduced-motion: reduce)")
        .returns({ matches: true } as MediaQueryList);
    });
    cy.get('[aria-label="Close"]').click();
    cy.get("@onClosed").should("have.been.calledOnce");
  });

  it("removes keyboard listeners when unmounted", () => {
    const onSelect = cy.spy().as("onSelect");
    cy.window().then((window) => {
      cy.spy(window, "addEventListener").as("addEventListener");
      cy.spy(window, "removeEventListener").as("removeEventListener");
    });
    mount(
      <Lightbox
        photos={photos}
        selectedIndex={0}
        previewSrc="/first-preview.jpg"
        navigationIndices={[0, 1, 2]}
        onSelect={onSelect}
        onClosed={cy.stub()}
      />,
    );
    cy.get("@addEventListener").should("have.been.calledWith", "keydown");
    mount(<div>Replacement</div>);
    cy.get("@removeEventListener").should("have.been.calledWith", "keydown");
    pressKey("ArrowRight");
    cy.get("@onSelect").should("not.have.been.called");
  });
});
