import { cubicBezier } from "motion/react";

export const MOTION_EASE_OUT_CONTROL_POINTS = [0.22, 0.61, 0.36, 1] as const;
export const MOTION_EASE_OUT = cubicBezier(...MOTION_EASE_OUT_CONTROL_POINTS);

export const MOTION_DEFAULT_TRANSITION = {
  duration: 0.3,
  ease: MOTION_EASE_OUT,
} as const;

export const ROUTE_EXIT_OFFSET_PX = -8;
export const ROUTE_TRANSITION = {
  duration: 0.18,
  ease: MOTION_EASE_OUT,
} as const;
