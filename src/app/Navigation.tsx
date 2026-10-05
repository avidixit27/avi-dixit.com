import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import portrait from "../assets/brand/avi-dixit-portrait.webp";
import wordmark from "../assets/brand/avi-dixit-wordmark.svg";
import { PORTFOLIO_PROJECTS } from "../features/portfolio/projects/portfolioProjects";
import { NAVIGATION_ITEMS, ROUTES } from "../resources/navigation";
import type { FeatureAvailability } from "./featureAvailability";

const NAV_FALLBACK_HEIGHT_PX = 64;
const PORTFOLIO_HIDE_DELAY_MS = 2000;
const HOME_RESET_DURATION_MS = 900;
const TOP_REVEAL_DISTANCE_PX = 80;
const PORTFOLIO_UPWARD_REVEAL_DELTA_PX = -40;
const PAGE_HIDE_DELTA_PX = 6;
const PAGE_REVEAL_DELTA_PX = -8;
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
const MENU_ANIMATION_MS = 450;
const MENU_ANIMATION_SECONDS = MENU_ANIMATION_MS / 1000;
const MENU_ITEM_STAGGER_SECONDS = 0.07;

interface NavigationProps {
  availability: FeatureAvailability;
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
  availability,
  onHomeResetEnd,
  onHomeResetStart,
  portfolioGridElement,
}: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = matchPath(ROUTES.home, location.pathname) !== null;
  const isPortfolioRoute =
    matchPath(`${ROUTES.portfolio}/:slug`, location.pathname) !== null;
  const isPortfolio = isHome || isPortfolioRoute;
  const navRef = useRef<HTMLElement>(null);
  const linksWrapRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLElement>());
  const pastGridRef = useRef(false);
  const observerReadyRef = useRef(true);
  const lastYRef = useRef(0);
  const inactivityTimerRef = useRef<number | null>(null);
  const homeResetFrameRef = useRef<number | null>(null);
  const portfolioNavigationTimerRef = useRef<number | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isDesktopPortfolioOpen, setIsDesktopPortfolioOpen] = useState(false);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [isMobilePortfolioOpen, setIsMobilePortfolioOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const [indicator, setIndicator] = useState<IndicatorPosition>({
    left: 0,
    width: 0,
    visible: false,
  });
  const visibleItems = useMemo(
    () =>
      NAVIGATION_ITEMS.filter(
        (item) => !item.feature || availability[item.feature],
      ),
    [availability],
  );
  const secondaryPortfolios = PORTFOLIO_PROJECTS.filter(
    (project) => project.available && project.route !== ROUTES.home,
  );
  const isMenuOpen =
    isDesktopPortfolioOpen || isMobileNavigationOpen || isMobilePortfolioOpen;

  const closeMenus = useCallback(() => {
    setIsDesktopPortfolioOpen(false);
    setIsMobilePortfolioOpen(false);
    setIsMobileNavigationOpen(false);
  }, []);

  const keepMenuVisible = () => {
    setIsHidden(false);
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) closeMenus();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };

    window.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeMenus, isMenuOpen]);

  useEffect(
    () => () => {
      if (homeResetFrameRef.current !== null) {
        window.cancelAnimationFrame(homeResetFrameRef.current);
      }
      if (portfolioNavigationTimerRef.current !== null) {
        window.clearTimeout(portfolioNavigationTimerRef.current);
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
    linkRefs.current.forEach((_, path) => {
      if (
        path !== ROUTES.portfolio &&
        !visibleItems.some((item) => item.path === path)
      ) {
        linkRefs.current.delete(path);
      }
    });

    const positionIndicator = () => {
      const wrapper = linksWrapRef.current;
      const activeLink = isPortfolioRoute
        ? ROUTES.portfolio
        : visibleItems.find((item) => matchPath(item.path, location.pathname))
            ?.path;
      const activeElement = activeLink
        ? linkRefs.current.get(activeLink)
        : undefined;
      if (!wrapper || !activeElement) {
        setIndicator((current) => ({ ...current, visible: false }));
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const linkRect = activeElement.getBoundingClientRect();
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
  }, [isPortfolioRoute, location.pathname, visibleItems]);

  useEffect(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    if (!isPortfolio) {
      return undefined;
    }

    const hideLater = () => {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      if (isMenuOpen) {
        inactivityTimerRef.current = null;
        return;
      }
      inactivityTimerRef.current = window.setTimeout(
        () => setIsHidden(true),
        PORTFOLIO_HIDE_DELAY_MS,
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
  }, [isMenuOpen, isPortfolio]);

  useEffect(() => {
    if (!isPortfolio || !portfolioGridElement) {
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
  }, [isPortfolio, portfolioGridElement]);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastYRef.current;

      if (isPortfolio && observerReadyRef.current) {
        if (nextY > 1 && !pastGridRef.current) setIsHidden(false);
        if (delta < PORTFOLIO_UPWARD_REVEAL_DELTA_PX) setIsHidden(false);
      } else {
        if (delta > PAGE_HIDE_DELTA_PX) setIsHidden(true);
        if (delta < PAGE_REVEAL_DELTA_PX) setIsHidden(false);
      }

      lastYRef.current = nextY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPortfolio]);

  useEffect(() => {
    if (!isPortfolio) return undefined;
    const revealNearTop = (event: MouseEvent) => {
      if (!pastGridRef.current && event.clientY < TOP_REVEAL_DISTANCE_PX) {
        setIsHidden(false);
      }
    };
    window.addEventListener("mousemove", revealNearTop);
    return () => window.removeEventListener("mousemove", revealNearTop);
  }, [isPortfolio]);

  const handleNavigationClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    setIsHidden(false);

    if (event.defaultPrevented || isModifiedActivation(event)) return;
    if (portfolioNavigationTimerRef.current !== null) {
      window.clearTimeout(portfolioNavigationTimerRef.current);
      portfolioNavigationTimerRef.current = null;
    }
    closeMenus();

    if (path !== ROUTES.home || !isHome) {
      if (homeResetFrameRef.current !== null) {
        window.cancelAnimationFrame(homeResetFrameRef.current);
        homeResetFrameRef.current = null;
        onHomeResetEnd?.();
      }
      return;
    }

    event.preventDefault();
    if (window.scrollY <= 1) return;

    if (homeResetFrameRef.current !== null) {
      window.cancelAnimationFrame(homeResetFrameRef.current);
      homeResetFrameRef.current = null;
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

  const handlePortfolioNavigationClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    setIsHidden(false);
    if (event.defaultPrevented || isModifiedActivation(event)) return;

    event.preventDefault();
    if (portfolioNavigationTimerRef.current !== null) return;

    closeMenus();
    if (homeResetFrameRef.current !== null) {
      window.cancelAnimationFrame(homeResetFrameRef.current);
      homeResetFrameRef.current = null;
      onHomeResetEnd?.();
    }

    if (reduceMotion) {
      navigate(path);
      return;
    }

    portfolioNavigationTimerRef.current = window.setTimeout(() => {
      portfolioNavigationTimerRef.current = null;
      navigate(path);
    }, MENU_ANIMATION_MS);
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
          className="flex items-center gap-1 md:gap-[5px]"
          onMouseDown={(event) => {
            if (!isModifiedActivation(event)) event.preventDefault();
          }}
          onClick={(event) => handleNavigationClick(event, ROUTES.home)}
        >
          <img
            src={portrait}
            alt=""
            width="192"
            height="192"
            className="h-12 w-12 rounded-full md:h-14 md:w-14"
          />
          <img
            src={wordmark}
            alt=""
            width="146"
            height="22"
            className="h-[17px] w-auto md:h-5"
          />
        </Link>

        <div
          ref={linksWrapRef}
          data-desktop-navigation="true"
          className="relative hidden items-start gap-4 text-sm sm:flex md:gap-8 md:text-base"
        >
          <span
            data-navigation-indicator="true"
            className={`absolute bottom-0 h-[1px] bg-brand-vivid transition-[transform,width] duration-250 ease-[cubic-bezier(.22,.61,.36,1)]
                        ${indicator.visible ? "opacity-100" : "opacity-0"}`}
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
            }}
            aria-hidden="true"
          />
          {visibleItems.map((item) => {
            const isActive = matchPath(item.path, location.pathname) !== null;
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

          <div className="relative">
            <button
              type="button"
              ref={(element) => {
                if (element) linkRefs.current.set(ROUTES.portfolio, element);
                else linkRefs.current.delete(ROUTES.portfolio);
              }}
              aria-expanded={isDesktopPortfolioOpen}
              aria-controls="desktop-portfolio-menu"
              onClick={() => {
                keepMenuVisible();
                setIsDesktopPortfolioOpen((isOpen) => !isOpen);
              }}
              className={`cursor-pointer pb-1 font-display ${
                isPortfolioRoute
                  ? "text-brand-warm"
                  : "text-text-muted hover:text-focus"
              }`}
            >
              PORTFOLIOS
            </button>
            <AnimatePresence>
              {isDesktopPortfolioOpen && (
                <m.nav
                  id="desktop-portfolio-menu"
                  aria-label="Portfolios"
                  className="absolute top-[calc(100%+1.125rem)] left-1/2 flex w-max -translate-x-1/2 flex-col items-end gap-2 overflow-hidden border-t border-r border-b border-l border-t-border border-r-canvas border-b-canvas border-l-canvas bg-[#4A4A4A] px-5 pt-3 pb-4 text-right shadow-panel"
                  initial={
                    reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }
                  }
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { clipPath: "inset(0 0 100% 0)" }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : MENU_ANIMATION_SECONDS,
                    ease: "easeInOut",
                  }}
                >
                  {secondaryPortfolios.map((project, index) => (
                    <m.div
                      key={project.id}
                      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
                      }
                      transition={{
                        duration: reduceMotion ? 0 : 0.2,
                        delay: reduceMotion
                          ? 0
                          : index * MENU_ITEM_STAGGER_SECONDS,
                      }}
                    >
                      <Link
                        to={project.route}
                        aria-label={project.title}
                        onClick={(event) =>
                          handlePortfolioNavigationClick(event, project.route)
                        }
                        className="font-display text-text-muted hover:text-focus focus-visible:text-focus focus-visible:outline-none"
                      >
                        {project.title}
                      </Link>
                    </m.div>
                  ))}
                </m.nav>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div data-mobile-navigation="true" className="sm:hidden">
          <button
            type="button"
            aria-label="Navigation menu"
            aria-expanded={isMobileNavigationOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => {
              keepMenuVisible();
              setIsMobileNavigationOpen((isOpen) => !isOpen);
              if (isMobileNavigationOpen) setIsMobilePortfolioOpen(false);
            }}
            className="grid h-11 w-11 cursor-pointer place-content-center gap-1.5"
          >
            <span className="h-px w-6 bg-text" />
            <span className="h-px w-6 bg-text" />
            <span className="h-px w-6 bg-text" />
          </button>
          <AnimatePresence>
            {isMobileNavigationOpen && (
              <m.div
                id="mobile-navigation-menu"
                className="fixed top-16 right-0 flex w-max origin-top flex-col items-end gap-3 overflow-hidden border-t border-r border-b border-l border-t-border border-r-canvas border-b-canvas border-l-canvas bg-[#4A4A4A] px-5 py-4 text-right text-base shadow-panel"
                initial={
                  reduceMotion
                    ? false
                    : { clipPath: "inset(0 0 100% 0)", y: -12 }
                }
                animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { clipPath: "inset(0 0 100% 0)", y: -12 }
                }
                transition={{
                  duration: reduceMotion ? 0 : MENU_ANIMATION_SECONDS,
                  ease: "easeInOut",
                }}
              >
                {visibleItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(event) => handleNavigationClick(event, item.path)}
                    className={`font-display ${
                      matchPath(item.path, location.pathname)
                        ? "text-brand-warm"
                        : "text-text-muted hover:text-focus"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  aria-label="Portfolios"
                  aria-expanded={isMobilePortfolioOpen}
                  aria-controls="mobile-portfolio-menu"
                  onClick={() => {
                    keepMenuVisible();
                    setIsMobilePortfolioOpen((isOpen) => !isOpen);
                  }}
                  className={`cursor-pointer font-display ${
                    isPortfolioRoute
                      ? "text-brand-warm"
                      : "text-text-muted hover:text-focus"
                  }`}
                >
                  PORTFOLIOS
                </button>
                <AnimatePresence>
                  {isMobilePortfolioOpen && (
                    <m.nav
                      id="mobile-portfolio-menu"
                      aria-label="Portfolios"
                      className="flex origin-top flex-col items-end gap-2 overflow-hidden border-r border-brand-vivid pr-3"
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : MENU_ANIMATION_SECONDS,
                        ease: "easeInOut",
                      }}
                    >
                      {secondaryPortfolios.map((project, index) => (
                        <m.div
                          key={project.id}
                          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{
                            duration: reduceMotion ? 0 : 0.2,
                            delay: reduceMotion
                              ? 0
                              : index * MENU_ITEM_STAGGER_SECONDS,
                          }}
                        >
                          <Link
                            to={project.route}
                            aria-label={project.title}
                            onClick={(event) =>
                              handlePortfolioNavigationClick(
                                event,
                                project.route,
                              )
                            }
                            className="font-display text-text-muted hover:text-focus focus-visible:text-focus focus-visible:outline-none"
                          >
                            {project.title}
                          </Link>
                        </m.div>
                      ))}
                    </m.nav>
                  )}
                </AnimatePresence>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
