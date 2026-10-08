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
import {
  getPortfolioProject,
  PORTFOLIO_PROJECTS,
} from "../features/portfolio/projects/portfolioProjects";
import { NAVIGATION_ITEMS, ROUTES } from "../resources/navigation";
import type { FeatureAvailability } from "./featureAvailability";
import PortfolioMenu from "./PortfolioMenu";

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
const COMPACT_MENU_ANIMATION_SECONDS = 0.24;
const SECONDARY_PORTFOLIOS = PORTFOLIO_PROJECTS.filter(
  (project) => project.available && project.route !== ROUTES.home,
);

interface NavigationProps {
  availability: FeatureAvailability;
  onHomeResetEnd?: () => void;
  onHomeResetStart?: () => void;
  onPortfolioNavigationComplete?: () => void;
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
  onPortfolioNavigationComplete,
  portfolioGridElement,
}: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = matchPath(ROUTES.home, location.pathname) !== null;
  const portfolioSlug = matchPath(
    `${ROUTES.portfolio}/:slug`,
    location.pathname,
  )?.params.slug;
  const isPortfolioRoute = Boolean(
    portfolioSlug && getPortfolioProject(portfolioSlug),
  );
  const isPortfolio = isHome || isPortfolioRoute;
  const navRef = useRef<HTMLElement>(null);
  const linksWrapRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLElement>());
  const pastGridRef = useRef(false);
  const observerReadyRef = useRef(true);
  const lastYRef = useRef(0);
  const inactivityTimerRef = useRef<number | null>(null);
  const homeResetFrameRef = useRef<number | null>(null);
  const openPortfolioAfterCompactMenuRef = useRef(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
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
  const isMenuOpen = isPortfolioMenuOpen || isMobileNavigationOpen;

  const closeMenus = useCallback(() => {
    openPortfolioAfterCompactMenuRef.current = false;
    setIsPortfolioMenuOpen(false);
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
      if ((event.target as Element).closest("[data-portfolio-menu]")) return;
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

  const handlePortfolioNavigation = (path: string) => {
    setIsHidden(true);
    if (homeResetFrameRef.current !== null) {
      window.cancelAnimationFrame(homeResetFrameRef.current);
      homeResetFrameRef.current = null;
      onHomeResetEnd?.();
    }

    navigate(path);
  };

  const isCompactMenuExpanded = isMobileNavigationOpen || isPortfolioMenuOpen;

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
          className={`relative hidden items-start gap-4 text-sm md:gap-8 md:text-base ${
            availability.shop ? "sm:flex" : "min-[480px]:flex"
          }`}
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
              aria-expanded={isPortfolioMenuOpen}
              aria-controls="portfolio-menu"
              onClick={() => {
                keepMenuVisible();
                setIsPortfolioMenuOpen((isOpen) => !isOpen);
              }}
              className={`cursor-pointer pb-1 font-display ${
                isPortfolioRoute
                  ? "text-brand-warm"
                  : "text-text-muted hover:text-focus"
              }`}
            >
              PORTFOLIOS
            </button>
          </div>
        </div>

        <div
          data-mobile-navigation="true"
          className={availability.shop ? "sm:hidden" : "min-[480px]:hidden"}
        >
          <button
            type="button"
            aria-label={
              isCompactMenuExpanded ? "Close navigation" : "Navigation menu"
            }
            aria-expanded={isMobileNavigationOpen || isPortfolioMenuOpen}
            aria-controls={
              isPortfolioMenuOpen ? "portfolio-menu" : "mobile-navigation-menu"
            }
            onClick={() => {
              keepMenuVisible();
              if (isPortfolioMenuOpen) {
                setIsPortfolioMenuOpen(false);
                return;
              }
              setIsMobileNavigationOpen((isOpen) => !isOpen);
            }}
            className="grid h-11 w-11 cursor-pointer place-content-center gap-1.5"
          >
            <span
              className={`h-px w-6 bg-text transition-transform ${
                isCompactMenuExpanded ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-text transition-opacity ${
                isCompactMenuExpanded ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-text transition-transform ${
                isCompactMenuExpanded ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
          <AnimatePresence
            onExitComplete={() => {
              if (!openPortfolioAfterCompactMenuRef.current) return;
              openPortfolioAfterCompactMenuRef.current = false;
              setIsPortfolioMenuOpen(true);
            }}
          >
            {isMobileNavigationOpen && (
              <m.div
                id="mobile-navigation-menu"
                className="fixed top-[4.5rem] right-2 w-52 origin-top-right bg-border p-px text-right text-base shadow-panel"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                style={{
                  clipPath:
                    "polygon(1.25rem 0, 100% 0, 100% calc(100% - 1.25rem), calc(100% - 1.25rem) 100%, 0 100%, 0 1.25rem)",
                }}
                transition={{
                  duration: reduceMotion ? 0 : COMPACT_MENU_ANIMATION_SECONDS,
                  ease: "easeInOut",
                }}
              >
                <div
                  className="flex w-full flex-col items-end bg-canvas p-2"
                  style={{
                    clipPath:
                      "polygon(1.2rem 0, 100% 0, 100% calc(100% - 1.2rem), calc(100% - 1.2rem) 100%, 0 100%, 0 1.2rem)",
                  }}
                >
                  {visibleItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(event) =>
                        handleNavigationClick(event, item.path)
                      }
                      className={`w-full border-b border-border px-3 py-3 font-display ${
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
                    aria-expanded={isPortfolioMenuOpen}
                    aria-controls="portfolio-menu"
                    onClick={() => {
                      keepMenuVisible();
                      openPortfolioAfterCompactMenuRef.current = true;
                      setIsMobileNavigationOpen(false);
                    }}
                    className={`w-full cursor-pointer px-3 py-3 text-right font-display ${
                      isPortfolioRoute
                        ? "text-brand-warm"
                        : "text-text-muted hover:text-focus"
                    }`}
                  >
                    PORTFOLIOS
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <PortfolioMenu
        isOpen={isPortfolioMenuOpen}
        projects={SECONDARY_PORTFOLIOS}
        reduceMotion={Boolean(reduceMotion)}
        transitionSeconds={MENU_ANIMATION_SECONDS}
        onClose={closeMenus}
        onNavigate={handlePortfolioNavigation}
        onNavigationComplete={() => onPortfolioNavigationComplete?.()}
      />
    </nav>
  );
}
