import { mount } from "@cypress/react";
import ResponsiveImage from "./ResponsiveImage";

describe("ResponsiveImage", () => {
  it("reserves photo geometry and stops the opt-in shimmer after load or error", () => {
    const onLoad = cy.stub().as("imageLoaded");
    const onError = cy.stub().as("imageFailed");
    mount(
      <div className="absolute top-[10000px] w-full">
        <ResponsiveImage
          src="/skeleton.jpg"
          srcSet="/skeleton.jpg 480w"
          sources={[]}
          sizes="100vw"
          width={600}
          height={400}
          alt="Loading test photo"
          loading="lazy"
          fetchPriority="low"
          showSkeleton
          pictureClassName="relative block overflow-hidden"
          className="h-auto w-full"
          onLoad={onLoad}
          onError={onError}
        />
      </div>,
    );
    cy.get("picture").should("have.class", "image-skeleton");
    cy.get("img").then(($image) => {
      const before = $image.get(0).getBoundingClientRect();
      $image.get(0).dispatchEvent(new Event("load"));
      cy.get("picture").should("not.have.class", "image-skeleton");
      cy.get("img").should(($loaded) => {
        expect($loaded.get(0).getBoundingClientRect().height).to.equal(
          before.height,
        );
      });
    });
    cy.get("@imageLoaded").should("have.been.calledOnce");
    cy.get("img").then(($image) =>
      $image.get(0).dispatchEvent(new Event("error")),
    );
    cy.get("picture").should("not.have.class", "image-skeleton");
    cy.get("@imageFailed").should("have.been.calledOnce");
  });
  it("renders an intrinsic responsive picture with an explicit loading policy", () => {
    mount(
      <ResponsiveImage
        src="/photo-960.jpg"
        srcSet="/photo-480.jpg 480w, /photo-960.jpg 960w"
        sources={[
          {
            type: "image/avif",
            srcSet: "/photo-480.avif 480w, /photo-960.avif 960w",
          },
          {
            type: "image/webp",
            srcSet: "/photo-480.webp 480w, /photo-960.webp 960w",
          },
        ]}
        sizes="100vw"
        width={6000}
        height={4000}
        alt="A test photograph"
        loading="eager"
        fetchPriority="high"
        className="responsive-photo"
      />,
    );

    cy.get("picture source")
      .first()
      .should("have.attr", "type", "image/avif")
      .and("have.attr", "srcset", "/photo-480.avif 480w, /photo-960.avif 960w");
    cy.get("picture source")
      .eq(1)
      .should("have.attr", "type", "image/webp")
      .and("have.attr", "srcset", "/photo-480.webp 480w, /photo-960.webp 960w");
    cy.get("picture img")
      .should("have.attr", "src", "/photo-960.jpg")
      .and("have.attr", "srcset", "/photo-480.jpg 480w, /photo-960.jpg 960w")
      .and("have.attr", "sizes", "100vw")
      .and("have.attr", "width", "6000")
      .and("have.attr", "height", "4000")
      .and("have.attr", "loading", "eager")
      .and("have.attr", "fetchpriority", "high")
      .and("have.attr", "decoding", "async")
      .and("have.class", "responsive-photo");
  });

  it("reports image loading failures", () => {
    const onError = cy.stub().as("onError");

    mount(
      <div className="absolute top-[10000px] w-full">
        <ResponsiveImage
          src="/missing.jpg"
          srcSet="/missing.jpg 480w"
          sources={[]}
          sizes="100vw"
          width={600}
          height={400}
          alt="A missing photograph"
          loading="lazy"
          fetchPriority="high"
          onError={onError}
          showSkeleton
          pictureClassName="relative block overflow-hidden"
        />
      </div>,
    );

    cy.get("picture").should("have.class", "image-skeleton");
    cy.get("picture img").then(($image) => {
      $image.get(0)?.dispatchEvent(new Event("error"));
    });
    cy.get("@onError").should("have.been.calledOnce");
    cy.get("picture").should("not.have.class", "image-skeleton");
  });
});
