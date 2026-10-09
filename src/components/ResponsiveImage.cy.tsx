import { mount } from "@cypress/react";
import ResponsiveImage from "./ResponsiveImage";

describe("ResponsiveImage", () => {
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
      <ResponsiveImage
        src="/missing.jpg"
        srcSet="/missing.jpg 480w"
        sources={[]}
        sizes="100vw"
        width={600}
        height={400}
        alt="A missing photograph"
        loading="eager"
        fetchPriority="high"
        onError={onError}
      />,
    );

    cy.get("picture img").then(($image) => {
      $image.get(0)?.dispatchEvent(new Event("error"));
    });
    cy.get("@onError").should("have.been.calledOnce");
  });
});
