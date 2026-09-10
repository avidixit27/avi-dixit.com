import { useReducedMotion, useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";
import signatureLogo from "../assets/icons/avi-signature-logo.svg";
import { SITE_DETAILS } from "../resources/site";
import {
  FOOTER_LANDING_OPACITY_START,
  FOOTER_PARALLAX_RATE,
  FOOTER_PARALLAX_SCROLL_OFFSETS,
  getFooterLandingFrame,
  getFooterLandingWheelPlan,
} from "./footerPresentationPolicy";

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: FOOTER_PARALLAX_SCROLL_OFFSETS,
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${FOOTER_PARALLAX_RATE * 100}%`, "0%"],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 1],
    [FOOTER_LANDING_OPACITY_START, 1],
  );
  const motionProps = reduceMotion ? {} : { style: { y, opacity } };

  useEffect(() => {
    if (reduceMotion) return;

    let animationFrame: number | null = null;
    let pendingImmediateDelta = 0;
    let previousFrameTime: number | null = null;
    let targetScrollY = window.scrollY;

    const cancelLanding = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      animationFrame = null;
      pendingImmediateDelta = 0;
      previousFrameTime = null;
      targetScrollY = window.scrollY;
    };

    const animateLanding = (frameTime: number) => {
      const elapsedMs =
        previousFrameTime === null ? 0 : frameTime - previousFrameTime;
      previousFrameTime = frameTime;
      const maximumScrollY =
        document.documentElement.scrollHeight - window.innerHeight;

      if (pendingImmediateDelta > 0) {
        window.scrollTo(
          0,
          Math.min(maximumScrollY, window.scrollY + pendingImmediateDelta),
        );
        pendingImmediateDelta = 0;
      }

      targetScrollY = Math.min(targetScrollY, maximumScrollY);
      const nextScrollY = getFooterLandingFrame({
        currentScrollY: window.scrollY,
        elapsedMs,
        targetScrollY,
      });

      window.scrollTo(0, nextScrollY);

      if (nextScrollY === targetScrollY) {
        animationFrame = null;
        previousFrameTime = null;
        return;
      }

      animationFrame = window.requestAnimationFrame(animateLanding);
    };

    const startLanding = () => {
      if (animationFrame !== null) return;

      previousFrameTime = performance.now();
      animationFrame = window.requestAnimationFrame(animateLanding);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) {
        cancelLanding();
        return;
      }

      if (
        event.defaultPrevented ||
        !event.cancelable ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        document.documentElement.classList.contains("modal-open")
      ) {
        cancelLanding();
        return;
      }

      const maximumScrollY =
        document.documentElement.scrollHeight - window.innerHeight;
      const effectiveScrollY = Math.min(
        maximumScrollY,
        window.scrollY + pendingImmediateDelta,
      );
      const wheelPlan = getFooterLandingWheelPlan({
        deltaMode: event.deltaMode,
        deltaY: event.deltaY,
        remainingDistance: maximumScrollY - effectiveScrollY,
        viewportHeight: window.innerHeight,
      });

      if (wheelPlan === null) return;

      event.preventDefault();
      pendingImmediateDelta += wheelPlan.immediateDelta;
      const scheduledScrollY = Math.min(
        maximumScrollY,
        window.scrollY + pendingImmediateDelta,
      );
      targetScrollY = Math.min(
        maximumScrollY,
        Math.max(targetScrollY, scheduledScrollY) + wheelPlan.easedDelta,
      );
      startLanding();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", cancelLanding);
    window.addEventListener("pointerdown", cancelLanding, { passive: true });
    window.addEventListener("resize", cancelLanding, { passive: true });
    window.addEventListener("touchstart", cancelLanding, { passive: true });

    return () => {
      cancelLanding();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", cancelLanding);
      window.removeEventListener("pointerdown", cancelLanding);
      window.removeEventListener("resize", cancelLanding);
      window.removeEventListener("touchstart", cancelLanding);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={footerRef}
      data-footer-reveal="true"
      className="relative z-0 h-footer"
    >
      <footer
        aria-label="Site footer"
        className="fixed inset-x-0 bottom-0 z-0 h-footer overflow-hidden border-t border-border bg-panel text-text-muted"
      >
        <m.div
          data-footer-parallax-content="true"
          className="relative h-full will-change-transform"
          {...motionProps}
        >
          <img
            src={signatureLogo}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-full max-w-[55vw] w-auto select-none object-contain opacity-95"
          />
          <p className="absolute right-[max(1rem,calc(env(safe-area-inset-right)+0.75rem))] bottom-[max(0.25rem,env(safe-area-inset-bottom))] z-10 font-footer text-footer-copy text-text-muted">
            {SITE_DETAILS.copyright}
          </p>
        </m.div>
      </footer>
    </div>
  );
}
