import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import signatureLogo from "../assets/icons/avi-signature-logo.svg";
import { SITE_DETAILS } from "../resources/site";
import {
  FOOTER_PARALLAX_RATE,
  FOOTER_PARALLAX_REVEAL_START,
} from "./footerPresentationPolicy";

export default function Footer() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(
    scrollYProgress,
    [FOOTER_PARALLAX_REVEAL_START, 1],
    [`${FOOTER_PARALLAX_RATE * 100}%`, "0%"],
  );
  const motionProps = reduceMotion ? {} : { style: { y } };

  return (
    <motion.footer
      aria-label="Site footer"
      className="fixed inset-x-0 bottom-0 z-0 h-footer overflow-hidden border-t border-border bg-panel text-text-muted"
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
    </motion.footer>
  );
}
