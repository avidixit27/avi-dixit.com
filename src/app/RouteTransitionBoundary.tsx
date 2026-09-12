import { AnimatePresence, useIsPresent, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode, Ref } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { ROUTES } from "../resources/navigation";
import NotFound from "./NotFound";
import RouteLoadingFallback from "./RouteLoadingFallback";

const Portfolio = lazy(() => import("../features/portfolio/Portfolio"));
const Shop = lazy(() => import("../features/shop/Shop"));
const Contact = lazy(() => import("../features/inquiries/Contact"));

const ROUTE_TRANSITION = { duration: 0.18, ease: "easeOut" } as const;

interface RouteTransitionBoundaryProps {
  portfolioGridRef: Ref<HTMLDivElement>;
}

function getRouteLabel(pathname: string) {
  if (pathname === ROUTES.home) return "Portfolio";
  if (pathname === ROUTES.shop) return "Print shop";
  if (pathname === ROUTES.contact) return "Contact";
  return "Page not found";
}

function RouteFrame({
  children,
  locationKey,
  navigationType,
  label,
}: {
  children: ReactNode;
  locationKey: string;
  navigationType: ReturnType<typeof useNavigationType>;
  label: string;
}) {
  const routeRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!isPresent || navigationType === "POP") return undefined;

    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => {
      routeRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isPresent, locationKey, navigationType]);

  return (
    <m.div
      ref={routeRef}
      data-route-content="true"
      tabIndex={-1}
      role="region"
      aria-label={label}
      aria-hidden={isPresent ? undefined : true}
      className={
        isPresent
          ? "relative"
          : "pointer-events-none absolute inset-x-0 top-0 z-20 w-full"
      }
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
      transition={reduceMotion ? { duration: 0 } : ROUTE_TRANSITION}
    >
      {children}
    </m.div>
  );
}

export default function RouteTransitionBoundary({
  portfolioGridRef,
}: RouteTransitionBoundaryProps) {
  const location = useLocation();
  const navigationType = useNavigationType();

  return (
    <div className="relative">
      <AnimatePresence initial={false}>
        <RouteFrame
          key={location.key}
          locationKey={location.key}
          navigationType={navigationType}
          label={getRouteLabel(location.pathname)}
        >
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes location={location}>
              <Route
                path={ROUTES.home}
                element={<Portfolio gridMarkerRef={portfolioGridRef} />}
              />
              <Route path={ROUTES.shop} element={<Shop />} />
              <Route path={ROUTES.contact} element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RouteFrame>
      </AnimatePresence>
    </div>
  );
}
