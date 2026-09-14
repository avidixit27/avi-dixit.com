import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSmall from "../assets/brand/avi-dixit-wordmark.svg";
import { NAVIGATION_ITEMS, ROUTES } from "../resources/navigation";

const NAV_FALLBACK_HEIGHT_PX = 64;
const HOME_HIDE_DELAY_MS = 2000;
const HOME_RESET_DURATION_MS = 900;
const TOP_REVEAL_DISTANCE_PX = 80;
const HOME_UPWARD_REVEAL_DELTA_PX = -40;
const PAGE_HIDE_DELTA_PX = 6;
const PAGE_REVEAL_DELTA_PX = -8;
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

interface NavigationProps {
  onHomeResetEnd?: () => void;
  onHomeResetStart?: () => void;
  portfolioGridElement: HTMLDivElement | null;
}

interface IndicatorPosition {
  left: number;
  width: number;
  visible: boolean;
}

function isModifiedActivation(event: ReactMouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

export default function Navigation({
  onHomeResetEnd,
  onHomeResetStart,
  portfolioGridElement,
}: NavigationProps) {
  const location = useLocation();
  const isHome = location.pathname === ROUTES.home;
  const navRef = useRef<HTMLElement>(null);
  const linksWrapRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const pastGridRef = useRef(false);
  const observerReadyRef = useRef(true);
  const lastYRef = useRef(0);
  const inactivityTimerRef = useRef<number | null>(null);
  const homeResetFrameRef = useRef<number | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [indicator, setIndicator] = useState<IndicatorPosition>({
    left: 0,
    width: 0,
    visible: false,
  });

  useEffect(
    () => () => {
      if (homeResetFrameRef.current !== null) {
        window.cancelAnimationFrame(homeResetFrameRef.current);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    if (isHome || homeResetFrameRef.current === null) return;

    window.cancelAnimationFrame(homeResetFrameRef.current);
    homeResetFrameRef.current = null;
    onHomeResetEnd?.();
  }, [isHome, onHomeResetEnd]);

  useEffect(() => {
    const positionIndicator = () => {
      const wrapper = linksWrapRef.current;
      const activeLink = linkRefs.current.get(location.pathname);
      if (!wrapper || !activeLink) {
        setIndicator((current) => ({ ...current, visible: false }));
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicator({
        left: linkRect.left - wrapperRect.left,
        width: linkRect.width,
        visible: true,
      });
    };

    const frame = requestAnimationFrame(positionIndicator);
    window.addEventListener("resize", positionIndicator);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", positionIndicator);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    if (!isHome) {
      return undefined;
    }

    const hideLater = () => {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = window.setTimeout(
        () => setIsHidden(true),
        HOME_HIDE_DELAY_MS,
      );
    };
    const revealTemporarily = () => {
      setIsHidden(false);
      hideLater();
    };

    hideLater();
    window.addEventListener("mousemove", revealTemporarily, { passive: true });
    window.addEventListener("scroll", revealTemporarily, { passive: true });
    return () => {
      window.removeEventListener("mousemove", revealTemporarily);
      window.removeEventListener("scroll", revealTemporarily);
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome || !portfolioGridElement) {
      pastGridRef.current = false;
      observerReadyRef.current = true;
      return undefined;
    }

    let observer: IntersectionObserver | undefined;
    const observeGrid = () => {
      observer?.disconnect();
      const navHeight = navRef.current?.offsetHeight ?? NAV_FALLBACK_HEIGHT_PX;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          pastGridRef.current = entry.boundingClientRect.top <= navHeight;
          observerReadyRef.current = true;
        },
        { root: null, threshold: 0, rootMargin: `-${navHeight}px 0px 0px 0px` },
      );
      observer.observe(portfolioGridElement);
    };

    observerReadyRef.current = false;
    observeGrid();
    window.addEventListener("resize", observeGrid);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeGrid);
    };
  }, [isHome, portfolioGridElement]);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastYRef.current;

      if (isHome && observerReadyRef.current) {
        if (nextY > 1 && !pastGridRef.current) setIsHidden(false);
        if (delta < HOME_UPWARD_REVEAL_DELTA_PX) setIsHidden(false);
      } else if (!isHome) {
        if (delta > PAGE_HIDE_DELTA_PX) setIsHidden(true);
        if (delta < PAGE_REVEAL_DELTA_PX) setIsHidden(false);
      }

      lastYRef.current = nextY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return undefined;
    const revealNearTop = (event: MouseEvent) => {
      if (!pastGridRef.current && event.clientY < TOP_REVEAL_DISTANCE_PX) {
        setIsHidden(false);
      }
    };
    window.addEventListener("mousemove", revealNearTop);
    return () => window.removeEventListener("mousemove", revealNearTop);
  }, [isHome]);

  const handleNavigationClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    setIsHidden(false);

    if (path !== ROUTES.home || !isHome) {
      if (homeResetFrameRef.current !== null) {
        window.cancelAnimationFrame(homeResetFrameRef.current);
        homeResetFrameRef.current = null;
        onHomeResetEnd?.();
      }
      return;
    }

    if (event.defaultPrevented || isModifiedActivation(event)) return;

    event.preventDefault();
    if (window.scrollY <= 1) return;

    if (homeResetFrameRef.current !== null) {
      window.cancelAnimationFrame(homeResetFrameRef.current);
    }
    onHomeResetStart?.();

    if (window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches) {
      window.scrollTo(0, 0);
      onHomeResetEnd?.();
      return;
    }

    const initialScrollY = window.scrollY;
    const startedAt = performance.now();
    const animateHomeReset = (frameTime: number) => {
      const progress = Math.min(
        (frameTime - startedAt) / HOME_RESET_DURATION_MS,
        1,
      );
      const easedProgress =
        progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

      window.scrollTo(0, initialScrollY * (1 - easedProgress));

      if (progress < 1) {
        homeResetFrameRef.current =
          window.requestAnimationFrame(animateHomeReset);
        return;
      }

      homeResetFrameRef.current = null;
      onHomeResetEnd?.();
    };

    homeResetFrameRef.current = window.requestAnimationFrame(animateHomeReset);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[90] border-b border-border bg-canvas/95 backdrop-blur-xl
                  transition-transform duration-500 ease-out
                  ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link
          to={ROUTES.home}
          aria-label="Home"
          onMouseDown={(event) => {
            if (!isModifiedActivation(event)) event.preventDefault();
          }}
          onClick={(event) => handleNavigationClick(event, ROUTES.home)}
        >
          <img
            src={logoSmall}
            alt="Avi Dixit"
            className="h-12 w-auto md:h-14"
          />
        </Link>

        <div
          ref={linksWrapRef}
          className="relative flex gap-4 text-sm md:gap-8 md:text-base"
        >
          <span
            className={`absolute bottom-0 h-[1px] bg-brand-vivid transition-[transform,width] duration-250 ease-[cubic-bezier(.22,.61,.36,1)]
                        ${indicator.visible ? "opacity-100" : "opacity-0"}`}
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
            }}
            aria-hidden="true"
          />
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                ref={(element) => {
                  if (element) linkRefs.current.set(item.path, element);
                  else linkRefs.current.delete(item.path);
                }}
                to={item.path}
                onClick={(event) => handleNavigationClick(event, item.path)}
                className={`pb-1 font-display ${
                  isActive
                    ? "text-brand-warm"
                    : "text-text-muted hover:text-focus"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
