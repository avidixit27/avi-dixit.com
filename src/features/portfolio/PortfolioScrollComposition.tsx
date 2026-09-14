import { useReducedMotion, useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";
import ResponsiveImage from "../../components/ResponsiveImage";
import { PORTFOLIO_COMPOSITION } from "./resources/portfolioComposition";
import type { Photo } from "./photoCatalog";
import {
  PORTFOLIO_COMPOSITION_IMAGE_SIZES,
  PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT,
} from "./portfolioCompositionPresentationPolicy";

interface PortfolioScrollCompositionProps {
  photos: readonly Photo[];
  onOpen: (index: number, previewSrc: string) => void;
}

function getPhotoSelection(photos: readonly Photo[], photoId: string) {
  const index = photos.findIndex((photo) => photo.id === photoId);
  const photo = index >= 0 ? photos[index] : undefined;

  return photo ? { index, photo } : null;
}

export default function PortfolioScrollComposition({
  photos,
  onOpen,
}: PortfolioScrollCompositionProps) {
  const stickyRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const stickySelection = getPhotoSelection(
    photos,
    PORTFOLIO_COMPOSITION.sticky.photoId,
  );
  const parallaxSelection = getPhotoSelection(
    photos,
    PORTFOLIO_COMPOSITION.parallax.photoId,
  );
  const { scrollYProgress: stickyScrollYProgress } = useScroll({
    target: stickyRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: parallaxScrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"],
  });
  const stickyY = useTransform(
    stickyScrollYProgress,
    [0, 1],
    [
      `${-PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT}%`,
      `${PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT}%`,
    ],
  );
  const parallaxY = useTransform(
    parallaxScrollYProgress,
    [0, 1],
    [
      `${-PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT}%`,
      `${PORTFOLIO_COMPOSITION_PARALLAX_OFFSET_PERCENT}%`,
    ],
  );
  const stickyMotionProps = reduceMotion ? {} : { style: { y: stickyY } };
  const parallaxMotionProps = reduceMotion ? {} : { style: { y: parallaxY } };

  if (!stickySelection || !parallaxSelection) return null;

  return (
    <>
      <div data-portfolio-stack-boundary="intro" className="relative isolate">
        <section
          data-portfolio-layer="intro"
          className="page-container relative z-0 bg-canvas py-24 sm:py-32 md:sticky md:top-0 motion-reduce:static lg:py-40"
        >
          <p className="font-inter text-xs tracking-[0.2em] text-brand-vivid uppercase">
            {PORTFOLIO_COMPOSITION.intro.eyebrow}
          </p>
          <div className="mt-6 max-w-3xl">
            <h2 className="font-display text-5xl leading-none text-text sm:text-7xl">
              {PORTFOLIO_COMPOSITION.intro.title}
            </h2>
            <p className="mt-6 max-w-xl font-inter text-lg leading-relaxed text-text-muted">
              {PORTFOLIO_COMPOSITION.intro.description}
            </p>
          </div>
        </section>

        <section
          ref={stickyRef}
          className="relative z-10 border-y border-border bg-surface"
        >
          <div className="page-container grid gap-10 py-16 md:min-h-[120svh] md:grid-cols-2 md:items-start md:gap-16 md:py-24">
            <div
              data-portfolio-sticky="true"
              className="md:sticky md:top-12 md:self-start"
            >
              <button
                type="button"
                className="block w-full cursor-pointer overflow-hidden rounded-panel border border-border bg-panel p-2 text-left shadow-panel sm:p-3"
                onClick={(event) =>
                  onOpen(
                    stickySelection.index,
                    event.currentTarget.querySelector("img")?.currentSrc ||
                      stickySelection.photo.src,
                  )
                }
                aria-label={`Open ${stickySelection.photo.alt}`}
              >
                <m.div
                  data-portfolio-sticky-content="true"
                  {...stickyMotionProps}
                >
                  <ResponsiveImage
                    src={stickySelection.photo.src}
                    srcSet={stickySelection.photo.srcSet}
                    sources={stickySelection.photo.sources}
                    sizes={PORTFOLIO_COMPOSITION_IMAGE_SIZES}
                    width={stickySelection.photo.width}
                    height={stickySelection.photo.height}
                    alt={stickySelection.photo.alt}
                    loading="lazy"
                    fetchPriority="low"
                    className="aspect-[4/5] w-full scale-[1.25] rounded-control object-cover"
                  />
                </m.div>
              </button>
            </div>
            <div className="md:pt-[38svh]">
              <p className="font-inter text-xs tracking-[0.2em] text-brand-warm uppercase">
                {PORTFOLIO_COMPOSITION.sticky.eyebrow}
              </p>
              <h2 className="mt-5 font-display text-5xl leading-none text-text sm:text-6xl">
                {PORTFOLIO_COMPOSITION.sticky.title}
              </h2>
              <p className="mt-6 max-w-md font-inter text-lg leading-relaxed text-text-muted">
                {PORTFOLIO_COMPOSITION.sticky.description}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div data-portfolio-stack-boundary="release" className="relative isolate">
        <section
          ref={parallaxRef}
          data-portfolio-parallax="true"
          className="relative z-10 overflow-hidden bg-canvas py-24 sm:py-32 lg:py-40"
        >
          <div className="page-container grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-16">
            <div className="md:pb-16">
              <p className="font-inter text-xs tracking-[0.2em] text-brand-cool uppercase">
                {PORTFOLIO_COMPOSITION.parallax.eyebrow}
              </p>
              <h2 className="mt-5 font-display text-5xl leading-none text-text sm:text-6xl">
                {PORTFOLIO_COMPOSITION.parallax.title}
              </h2>
              <p className="mt-6 max-w-md font-inter text-lg leading-relaxed text-text-muted">
                {PORTFOLIO_COMPOSITION.parallax.description}
              </p>
            </div>
            <div className="overflow-hidden rounded-panel border border-border bg-panel p-2 shadow-panel sm:p-3">
              <m.button
                type="button"
                data-portfolio-parallax-content="true"
                className="block w-full cursor-pointer"
                {...parallaxMotionProps}
                onClick={(event) =>
                  onOpen(
                    parallaxSelection.index,
                    event.currentTarget.querySelector("img")?.currentSrc ||
                      parallaxSelection.photo.src,
                  )
                }
                aria-label={`Open ${parallaxSelection.photo.alt}`}
              >
                <ResponsiveImage
                  src={parallaxSelection.photo.src}
                  srcSet={parallaxSelection.photo.srcSet}
                  sources={parallaxSelection.photo.sources}
                  sizes={PORTFOLIO_COMPOSITION_IMAGE_SIZES}
                  width={parallaxSelection.photo.width}
                  height={parallaxSelection.photo.height}
                  alt={parallaxSelection.photo.alt}
                  loading="lazy"
                  fetchPriority="low"
                  className="aspect-[5/4] w-full scale-[1.25] rounded-control object-cover"
                />
              </m.button>
            </div>
          </div>
        </section>

        <section
          data-portfolio-layer="release"
          className="relative z-0 bg-brand-vivid py-24 text-canvas sm:py-32 md:sticky md:bottom-0 motion-reduce:static lg:py-40"
        >
          <div className="page-container max-w-5xl">
            <p className="font-inter text-xs tracking-[0.2em] uppercase">
              {PORTFOLIO_COMPOSITION.release.eyebrow}
            </p>
            <h2 className="mt-6 font-display text-5xl leading-none sm:text-7xl lg:text-8xl">
              {PORTFOLIO_COMPOSITION.release.title}
            </h2>
            {PORTFOLIO_COMPOSITION.release.description && (
              <p className="mt-6 max-w-xl font-inter text-lg leading-relaxed">
                {PORTFOLIO_COMPOSITION.release.description}
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
