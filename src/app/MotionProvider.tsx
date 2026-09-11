import { LazyMotion, MotionConfig } from "motion/react";
import type { PropsWithChildren } from "react";
import { MOTION_DEFAULT_TRANSITION } from "./motionPresentationPolicy";

const loadMotionFeatures = () =>
  import("./motionFeatures").then((module) => module.default);

export default function MotionProvider({ children }: PropsWithChildren) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user" transition={MOTION_DEFAULT_TRANSITION}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
