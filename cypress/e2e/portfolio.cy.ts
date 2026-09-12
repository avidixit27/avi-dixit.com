describe("photography portfolio", () => {
  it("serves responsive media with bounded first-view priority", () => {
    cy.clock();
    cy.visit("/");

    cy.get('[aria-label="Open hero image gallery"] img').should(($images) => {
      expect($images).to.have.length(2);

      const first = $images.get(0) as HTMLImageElement;
      const second = $images.get(1) as HTMLImageElement;

      expect(first.getAttribute("srcset")).to.match(/480w.*960w.*1440w.*2160w/);

      expect(first.getAttribute("fetchpriority")).to.equal("high");
      expect(second.getAttribute("fetchpriority")).to.equal("low");

      expect(first.getAttribute("width")).to.match(/^\d+$/);
      expect(first.getAttribute("height")).to.match(/^\d+$/);

      expect(first.currentSrc).to.match(/-[\w-]+\.(?:jpg|webp)$/);
    });

    cy.get("main button")
      .first()
      .find("img")
      .should(($image) => {
        const image = $image.get(0);

        expect(image.getAttribute("loading")).to.equal("lazy");
        expect(image.getAttribute("fetchpriority")).to.equal("low");
        expect(image.getAttribute("sizes")).to.contain("min-width: 1024px");
      });

    cy.get("main button")
      .first()
      .should(($card) => {
        const card = $card.get(0);

        if (!card) {
          throw new Error("Expected a rendered gallery card");
        }

        const style = getComputedStyle(card);

        expect(style.willChange).to.equal("auto");
        expect(style.contain).not.to.contain("paint");
      });
  });

  it("opens, navigates, and closes the gallery", () => {
    cy.visit("/");
    cy.get('[aria-label="Open hero image gallery"]')
      .should("be.visible")
      .click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get("html").should("have.class", "modal-open");
    cy.get('[data-lightbox-stage="true"]')
      .should("have.attr", "aria-busy", "false")
      .then(($stage) => {
        const initialRect = $stage.get(0)?.getBoundingClientRect();
        if (!initialRect) throw new Error("Expected a lightbox stage");
        cy.get('[aria-label="Next image"]').then(($button) => {
          const initialOpacity = getComputedStyle($button.get(0)).opacity;
          cy.wrap($button).click().click();
          cy.get('[data-lightbox-outgoing="true"]').should("exist");
          cy.get('[aria-label="Next image"]')
            .should("not.be.disabled")
            .and("have.css", "opacity", initialOpacity)
            .and("not.have.attr", "aria-disabled");
        });
        cy.get('[data-lightbox-stage="true"]').should(($nextStage) => {
          const nextRect = $nextStage.get(0)?.getBoundingClientRect();
          expect(nextRect?.width).to.equal(initialRect.width);
          expect(nextRect?.height).to.equal(initialRect.height);
        });
        cy.get('[data-lightbox-outgoing="true"]').should("not.exist");
        cy.get('[aria-label="Next image"]').should(
          "not.have.attr",
          "aria-disabled",
        );
      });
    cy.get('[role="dialog"] img[alt]:not([alt=""])').should("be.visible");
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.get("html").should("not.have.class", "modal-open");
  });

  it("opens from the rendered preview and closes only from the backdrop", () => {
    cy.visit("/");
    cy.get(
      'main [aria-label="Open A person photographing their reflection in a tall mirror outdoors"]',
    )
      .scrollIntoView()
      .find("img")
      .should(($image) => {
        const image = $image.get(0);
        if (!image) throw new Error("Expected a rendered portrait thumbnail");
        expect(image.complete).to.equal(true);
        expect(image.naturalWidth).to.be.greaterThan(0);
      })
      .then(($image) => {
        const previewSrc =
          ($image.prop("currentSrc") as string) ||
          ($image.attr("src") as string);
        cy.wrap($image).click();
        cy.get('[data-lightbox-preview="true"]').should(
          "have.attr",
          "src",
          previewSrc,
        );
      });

    cy.get('[role="dialog"] img[alt]:not([alt=""])').click();
    cy.get('[role="dialog"]').should("exist");
    cy.get('[role="dialog"] img[alt]:not([alt=""])').then(($image) => {
      const image = $image.get(0);
      if (!image) throw new Error("Expected a rendered lightbox image");
      const imageRect = image.getBoundingClientRect();
      const backdropX = imageRect.left / 2;
      const backdropY = imageRect.top + imageRect.height / 2;
      cy.window().then((window) => {
        const backdrop = window.document.elementFromPoint(backdropX, backdropY);
        expect(backdrop?.getAttribute("aria-label")).to.equal(
          "Close photo viewer",
        );
        (backdrop as HTMLElement).click();
      });
    });
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("supports the current shop and contact route behavior", () => {
    cy.visit("/shop");
    cy.contains("button", "Add to Cart").first().click().click();
    cy.contains("Cart (2)").should("be.visible");
    cy.contains("Total:").parent().should("contain.text", "$298.00");

    cy.visit("/contact");
    cy.get('input[name="email"]').should("have.attr", "type", "email");
    cy.contains("button", "Send Message").should("be.enabled");
    cy.get("footer")
      .should("contain.text", "Copyright @Avi Dixit 2026")
      .and("not.contain.text", "avidixit27@gmail.com")
      .and("not.contain.text", "Instagram");
    cy.get(".custom-scrollbar").should("not.exist");
  });

  it("updates routes immediately with deliberate focus and scroll behavior", () => {
    cy.visit("/");
    cy.scrollTo(0, 1200);
    cy.window().its("scrollY").should("be.greaterThan", 0);

    cy.contains("a", "SHOP").click();
    cy.location("pathname").should("eq", "/shop");
    cy.window().its("scrollY").should("equal", 0);
    cy.get('[data-route-content="true"]:not([aria-hidden="true"])')
      .should("have.attr", "aria-label", "Print shop")
      .and("have.focus");
    cy.contains("h1", "Print shop").should("be.visible");

    cy.contains("a", "CONTACT").click();
    cy.location("pathname").should("eq", "/contact");
    cy.get('[data-route-content="true"]:not([aria-hidden="true"])')
      .should("have.attr", "aria-label", "Contact")
      .and("have.focus");
    cy.contains("h1", "Contact").should("be.visible");

    cy.go("back");
    cy.location("pathname").should("eq", "/shop");
    cy.contains("h1", "Print shop").should("be.visible");

    cy.go("back");
    cy.location("pathname").should("eq", "/");
    cy.window().its("scrollY").should("be.greaterThan", 0);
  });

  it("keeps an unknown route informative and reachable", () => {
    cy.visit("/unknown-route");
    cy.contains("h1", "Page not found").should("be.visible");
  });

  it("keeps semantic color utilities in the production stylesheet", () => {
    cy.visit("/contact");
    cy.get('input[name="email"]')
      .focus()
      .should(($input) => {
        expect(getComputedStyle($input.get(0)).borderBottomColor).to.equal(
          "rgb(255, 225, 147)",
        );
      });

    cy.visit("/shop");
    cy.contains("p", "$149").should(($price) => {
      expect(getComputedStyle($price.get(0)).color).to.equal(
        "rgb(230, 173, 255)",
      );
    });
  });

  it("uses the approved dark canvas across the application shell", () => {
    cy.visit("/contact");
    cy.get("body").should(($body) => {
      expect(getComputedStyle($body.get(0)).backgroundColor).to.equal(
        "rgb(14, 14, 14)",
      );
    });
  });

  it("composes the home portfolio with sticky, parallax, and color-release chapters", () => {
    cy.viewport(1280, 800);
    cy.visit("/");

    cy.contains("h2", /all I could see was mayhem/).should("be.visible");
    cy.get('[data-portfolio-sticky="true"]')
      .should("have.class", "md:sticky")
      .find(
        'img[alt="A seated person looking into a small mirror on the ground"]',
      )
      .should("be.visible");
    cy.get('[data-portfolio-parallax="true"]')
      .find(
        'img[alt="A crouching figure partially reflected in a small outdoor mirror"]',
      )
      .should("be.visible");
    cy.contains("h2", "Something delightful and endlessly intriguing.")
      .closest("section")
      .should("have.class", "bg-brand-vivid")
      .and("have.class", "text-canvas");

    cy.viewport(390, 844);
    cy.visit("/");
    cy.get('[data-portfolio-sticky="true"]').should(($sticky) => {
      expect(getComputedStyle($sticky.get(0)).position).to.equal("static");
    });
    cy.get('[data-portfolio-parallax="true"]')
      .scrollIntoView()
      .should("be.visible");
  });

  it("reveals the footer with bounded parallax at desktop and mobile widths", () => {
    cy.viewport(1280, 800);
    cy.visit("/");
    cy.get('footer[aria-label="Site footer"]').should(($footer) => {
      const footer = $footer.get(0);
      if (!footer) throw new Error("Expected site footer");
      const rect = footer.getBoundingClientRect();
      const pageDocument = footer.ownerDocument;
      expect(
        pageDocument
          .elementFromPoint(rect.left + rect.width / 2, rect.top + 16)
          ?.closest("footer"),
      ).not.to.equal(footer);
    });

    cy.scrollTo("bottom");
    cy.window().should((pageWindow) => {
      const currentBottom =
        pageWindow.document.documentElement.scrollHeight -
        pageWindow.innerHeight;
      expect(pageWindow.scrollY).to.be.closeTo(currentBottom, 1);
    });
    cy.get('footer[aria-label="Site footer"]').should(($footer) => {
      const footer = $footer.get(0);
      if (!footer) throw new Error("Expected site footer");
      const rect = footer.getBoundingClientRect();
      const viewportHeight = footer.ownerDocument.defaultView?.innerHeight ?? 0;
      expect(viewportHeight).to.be.greaterThan(0);
      expect(rect.top).to.be.lessThan(viewportHeight);
      expect(rect.bottom).to.be.at.most(viewportHeight);
      expect(getComputedStyle(footer).transform).to.equal("none");
    });
    cy.contains("Copyright @Avi Dixit 2026").should("be.visible");
    cy.document().should((pageDocument) => {
      expect(pageDocument.documentElement.scrollWidth).to.equal(
        pageDocument.documentElement.clientWidth,
      );
    });

    cy.scrollTo("top");
    cy.get('footer[aria-label="Site footer"]').should(($footer) => {
      const footer = $footer.get(0);
      if (!footer) throw new Error("Expected site footer");
      const rect = footer.getBoundingClientRect();
      const pageDocument = footer.ownerDocument;
      expect(
        pageDocument
          .elementFromPoint(rect.left + rect.width / 2, rect.top + 16)
          ?.closest("footer"),
      ).not.to.equal(footer);
    });

    cy.viewport(390, 844);
    cy.visit("/");
    cy.get('footer[aria-label="Site footer"]').should(($footer) => {
      const footer = $footer.get(0);
      if (!footer) throw new Error("Expected site footer");
      const rect = footer.getBoundingClientRect();
      const pageDocument = footer.ownerDocument;
      expect(
        pageDocument
          .elementFromPoint(rect.left + rect.width / 2, rect.top + 16)
          ?.closest("footer"),
      ).not.to.equal(footer);
    });
    cy.scrollTo("bottom");
    cy.window().should((pageWindow) => {
      const currentBottom =
        pageWindow.document.documentElement.scrollHeight -
        pageWindow.innerHeight;
      expect(pageWindow.scrollY).to.be.closeTo(currentBottom, 1);
    });
    cy.get('footer[aria-label="Site footer"]').should(($footer) => {
      const footer = $footer.get(0);
      if (!footer) throw new Error("Expected site footer");
      expect(getComputedStyle(footer).transform).to.equal("none");
    });
  });

  it("keeps primary navigation and gallery access usable on mobile", () => {
    cy.viewport(390, 844);
    cy.visit("/");
    cy.contains("a", "SHOP").should("be.visible");
    cy.get('[aria-label="Open hero image gallery"]').should("be.visible");
    cy.get('main [aria-label^="Open "]')
      .first()
      .scrollIntoView()
      .should("be.visible");
  });

  it("uses portrait hero media and a separate accessible close target on mobile", () => {
    cy.viewport(390, 844);
    cy.visit("/");

    cy.get('[aria-label="Open hero image gallery"] img')
      .first()
      .should(
        "have.attr",
        "alt",
        "A person photographing their reflection in a tall mirror outdoors",
      )
      .click();

    cy.get('[aria-label="Close"]')
      .should("be.visible")
      .then(($close) => {
        const close = $close.get(0);
        const stage = Cypress.$('[data-lightbox-stage="true"]').get(0);
        if (!close || !stage) {
          throw new Error("Expected lightbox close target and stage");
        }

        const closeRect = close.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        expect(closeRect.width).to.be.at.least(44);
        expect(closeRect.height).to.be.at.least(44);
        expect(
          closeRect.right <= stageRect.left ||
            closeRect.left >= stageRect.right ||
            closeRect.bottom <= stageRect.top ||
            closeRect.top >= stageRect.bottom,
        ).to.equal(true);
      })
      .click();

    cy.get('[role="dialog"]').should("not.exist");
  });

  it("renders content when reduced motion is requested", () => {
    Cypress.automation("remote:debugger:protocol", {
      command: "Emulation.setEmulatedMedia",
      params: {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      },
    });
    cy.visit("/");
    cy.get('[aria-label="Open hero image gallery"]').should("be.visible");
    cy.get('[data-portfolio-parallax-content="true"]').should(
      "not.have.attr",
      "style",
    );
    cy.get('footer[aria-label="Site footer"]').should(
      "have.css",
      "transform",
      "none",
    );
  });
});
