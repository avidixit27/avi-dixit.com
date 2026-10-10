import { AnimatePresence, useIsPresent, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import type { ReactNode, Ref } from "react";
import {
  matchPath,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import Portfolio from "../features/portfolio/Portfolio";
import { getPortfolioProject } from "../features/portfolio/projects/portfolioProjects";
import { ROUTES } from "../resources/navigation";
import {
  ROUTE_EXIT_OFFSET_PX,
  ROUTE_TRANSITION,
} from "./motionPresentationPolicy";
import NotFound from "./NotFound";
import type { FeatureAvailability } from "./featureAvailability";
import RouteLoadingFallback from "./RouteLoadingFallback";

const Shop = lazy(() => import("../features/shop/Shop"));
const Contact = lazy(() => import("../features/inquiries/Contact"));
const PortfolioProjectRoute = lazy(
  () => import("../features/portfolio/projects/PortfolioProjectRoute"),
);
interface RouteTransitionBoundaryProps {
  availability: FeatureAvailability;
  onRouteFocusComplete?: () => void;
  portfolioGridRef: Ref<HTMLDivElement>;
  routeFocusRequested?: boolean;
}

function getRouteLabel(pathname: string, availability: FeatureAvailability) {
  if (matchPath(ROUTES.home, pathname)) return "Portfolio";
  if (matchPath(ROUTES.artistStatement, pathname)) return "Portfolio";
  const portfolioSlug = matchPath(`${ROUTES.portfolio}/:slug`, pathname)?.params
    .slug;
  if (portfolioSlug && getPortfolioProject(portfolioSlug)) return "Portfolio";
  if (availability.shop && matchPath(ROUTES.shop, pathname))
    return "Print shop";
  if (availability.contact && matchPath(ROUTES.contact, pathname)) {
    return "Contact";
  }
  return "Page not found";
}

function RouteFrame({
  children,
  navigationType,
  label,
  routeFocusRequested,
  onRouteFocusComplete,
}: {
  children: ReactNode;
  navigationType: ReturnType<typeof useNavigationType>;
  label: string;
  routeFocusRequested: boolean;
  onRouteFocusComplete: (() => void) | undefined;
}) {
  const routeRef = useRef<HTMLDivElement>(null);
  const navigationTypeOnMount = useRef(navigationType);
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const route = routeRef.current;
    if (!route) return;

    if (isPresent) {
      route.removeAttribute("inert");
      return;
    }

    route.setAttribute("inert", "");
  }, [isPresent]);

  useLayoutEffect(() => {
    if (!isPresent || navigationTypeOnMount.current === "POP") return undefined;

    window.scrollTo(0, 0);
    if (document.documentElement.classList.contains("modal-open")) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() =>
      routeRef.current?.focus({ preventScroll: true }),
    );

    return () => window.cancelAnimationFrame(frame);
  }, [isPresent]);

  useLayoutEffect(() => {
    if (!isPresent || !routeFocusRequested) return undefined;

    const frame = window.requestAnimationFrame(() => {
      routeRef.current?.focus({ preventScroll: true });
      onRouteFocusComplete?.();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isPresent, onRouteFocusComplete, routeFocusRequested]);

  return (
    <m.div
      ref={routeRef}
      data-route-content="true"
      tabIndex={-1}
      role="region"
      aria-label={label}
      aria-hidden={isPresent ? undefined : true}
      className={`relative min-h-screen bg-canvas ${
        isPresent ? "" : "pointer-events-none"
      }`}
      initial={reduceMotion ? false : { opacity: 0, y: -ROUTE_EXIT_OFFSET_PX }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduceMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: ROUTE_EXIT_OFFSET_PX }
      }
      transition={reduceMotion ? { duration: 0 } : ROUTE_TRANSITION}
    >
      {children}
    </m.div>
  );
}

export default function RouteTransitionBoundary({
  availability,
  onRouteFocusComplete,
  portfolioGridRef,
  routeFocusRequested = false,
}: RouteTransitionBoundaryProps) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const routeLabel = getRouteLabel(location.pathname, availability);

  return (
    <div className="relative">
      <AnimatePresence initial={false} mode="wait">
        <RouteFrame
          key={location.pathname}
          navigationType={navigationType}
          label={routeLabel}
          routeFocusRequested={routeFocusRequested}
          onRouteFocusComplete={onRouteFocusComplete}
        >
          <Suspense
            fallback={
              <RouteLoadingFallback
                showImageSkeleton={routeLabel === "Portfolio"}
              />
            }
          >
            <Routes location={location}>
              <Route
                path={ROUTES.home}
                element={<Portfolio gridMarkerRef={portfolioGridRef} />}
              />
              <Route
                path={ROUTES.artistStatement}
                element={
                  <Navigate to={`${ROUTES.home}#artist-statement`} replace />
                }
              />
              <Route
                path={`${ROUTES.portfolio}/:slug`}
                element={
                  <PortfolioProjectRoute gridMarkerRef={portfolioGridRef} />
                }
              />
              {availability.shop && (
                <Route path={ROUTES.shop} element={<Shop />} />
              )}
              {availability.contact && (
                <Route path={ROUTES.contact} element={<Contact />} />
              )}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RouteFrame>
      </AnimatePresence>
    </div>
  );
}
