import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { PropsWithChildren } from "react";
import { MOTION_DEFAULT_TRANSITION } from "./motionPresentationPolicy";

export default function MotionProvider({ children }: PropsWithChildren) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={MOTION_DEFAULT_TRANSITION}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
