export const FOOTER_PARALLAX_RATE = 0.2;
export const FOOTER_PARALLAX_SCROLL_OFFSETS: ["start end", "end end"] = [
  "start end",
  "end end",
];
export const FOOTER_LANDING_OPACITY_START = 0.94;
export const FOOTER_LANDING_ZONE_VIEWPORT_RATIO = 1;
export const FOOTER_LANDING_TIME_CONSTANT_MS = 75;
export const FOOTER_LANDING_SETTLE_THRESHOLD_PX = 0.5;

const WHEEL_LINE_HEIGHT_PX = 16;

interface FooterLandingWheelInput {
  deltaMode: number;
  deltaY: number;
  remainingDistance: number;
  viewportHeight: number;
}

export function getFooterLandingWheelPlan({
  deltaMode,
  deltaY,
  remainingDistance,
  viewportHeight,
}: FooterLandingWheelInput) {
  if (deltaY <= 0 || remainingDistance <= 0 || viewportHeight <= 0) {
    return null;
  }

  const pixelDelta =
    deltaMode === 1
      ? deltaY * WHEEL_LINE_HEIGHT_PX
      : deltaMode === 2
        ? deltaY * viewportHeight
        : deltaY;
  const landingZone = viewportHeight * FOOTER_LANDING_ZONE_VIEWPORT_RATIO;
  const distanceBeforeZone = Math.max(0, remainingDistance - landingZone);

  const immediateDelta = Math.min(pixelDelta, distanceBeforeZone);
  const easedDelta = Math.min(
    pixelDelta - immediateDelta,
    remainingDistance - immediateDelta,
  );

  return { easedDelta, immediateDelta };
}

interface FooterLandingFrameInput {
  currentScrollY: number;
  elapsedMs: number;
  targetScrollY: number;
}

export function getFooterLandingFrame({
  currentScrollY,
  elapsedMs,
  targetScrollY,
}: FooterLandingFrameInput) {
  const remainingDistance = targetScrollY - currentScrollY;

  if (remainingDistance <= FOOTER_LANDING_SETTLE_THRESHOLD_PX) {
    return targetScrollY;
  }

  if (elapsedMs <= 0) return currentScrollY;

  const frameProgress =
    1 - Math.exp(-elapsedMs / FOOTER_LANDING_TIME_CONSTANT_MS);

  return currentScrollY + remainingDistance * frameProgress;
}
