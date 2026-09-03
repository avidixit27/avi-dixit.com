import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSmall from "../imgs/header/avi_dixit_logo.svg";
import { NAVIGATION_ITEMS, ROUTES } from "../resources/navigation";

const NAV_FALLBACK_HEIGHT_PX = 64;
const HOME_HIDE_DELAY_MS = 2000;
const TOP_REVEAL_DISTANCE_PX = 80;
const HOME_UPWARD_REVEAL_DELTA_PX = -40;
const PAGE_HIDE_DELTA_PX = 6;
const PAGE_REVEAL_DELTA_PX = -8;

export default function Navigation({ portfolioGridElement }) {
  const location = useLocation();
  const isHome = location.pathname === ROUTES.home;
  const navRef = useRef(null);
  const linksWrapRef = useRef(null);
  const linkRefs = useRef(new Map());
  const pastGridRef = useRef(false);
  const observerReadyRef = useRef(true);
  const lastYRef = useRef(0);
  const inactivityTimerRef = useRef(null);
  const [isHidden, setIsHidden] = useState(false);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    visible: false,
  });

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
    clearTimeout(inactivityTimerRef.current);
    if (!isHome) {
      return undefined;
    }

    const hideLater = () => {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(
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
      clearTimeout(inactivityTimerRef.current);
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome || !portfolioGridElement) {
      pastGridRef.current = false;
      observerReadyRef.current = true;
      return undefined;
    }

    let observer;
    const observeGrid = () => {
      observer?.disconnect();
      const navHeight = navRef.current?.offsetHeight ?? NAV_FALLBACK_HEIGHT_PX;
      observer = new IntersectionObserver(
        ([entry]) => {
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
    const revealNearTop = (event) => {
      if (!pastGridRef.current && event.clientY < TOP_REVEAL_DISTANCE_PX) {
        setIsHidden(false);
      }
    };
    window.addEventListener("mousemove", revealNearTop);
    return () => window.removeEventListener("mousemove", revealNearTop);
  }, [isHome]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[90] bg-primary/95 backdrop-blur-xl border-b border-secondary/20
                  transition-transform duration-500 ease-out
                  ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="flex items-center justify-between h-16 px-8">
        <Link
          to={ROUTES.home}
          aria-label="Home"
          onClick={() => setIsHidden(false)}
        >
          <img src={logoSmall} alt="Logo" className="h-10 w-auto" />
        </Link>

        <div ref={linksWrapRef} className="relative flex gap-8 text-base">
          <span
            className={`absolute bottom-0 h-[1px] bg-ink transition-[transform,width] duration-250 ease-[cubic-bezier(.22,.61,.36,1)]
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
                onClick={() => setIsHidden(false)}
                className={`pb-1 font-['Phosphate-Inline'] ${
                  isActive
                    ? "text-ink font-extrabold"
                    : "text-ink/55 hover:text-accentWarm"
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
