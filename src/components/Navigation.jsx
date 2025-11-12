import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSmall from "../imgs/header/avi_dixit_logo.svg";

export default function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navRef = useRef(null);
  const linksWrapRef = useRef(null);
  const homeRef = useRef(null);
  const shopRef = useRef(null);
  const contactRef = useRef(null);

  const [isHidden, setIsHidden] = useState(isHome);
  const isHiddenRef = useRef(isHidden);

  const [isPastGrid, setIsPastGrid] = useState(false);
  const pastGridRef = useRef(false);
  const [ioReady, setIoReady] = useState(!isHome);
  const lastY = useRef(0);
  const ioRef = useRef(null);
  const inactivityTimer = useRef(null);

  const navH = () => navRef.current?.offsetHeight ?? 64;
  const setNavVars = () => {
    const h = navH();
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
    document.documentElement.style.setProperty("--nav-pt", isHiddenRef.current ? "0px" : `${h}px`);
  };

  useEffect(() => { isHiddenRef.current = isHidden; setNavVars(); }, [isHidden]);
  useLayoutEffect(() => { setNavVars(); }, []);

  // ---- underline indicator ----
  const [ink, setInk] = useState({ left: 0, width: 0, visible: false });
  const activeRef = () => {
    if (location.pathname === "/") return homeRef.current;
    if (location.pathname === "/shop") return shopRef.current;
    if (location.pathname === "/contact") return contactRef.current;
    return null;
  };
  const positionIndicator = () => {
    const wrap = linksWrapRef.current;
    const el = activeRef();
    if (!wrap || !el) return;
    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setInk({ left: elRect.left - wrapRect.left, width: elRect.width, visible: true });
  };
  useEffect(() => {
    const id = requestAnimationFrame(positionIndicator);
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  // ---- inactivity timer (2 s auto-hide on first load) ----
  useEffect(() => {
    if (!isHome) return;
    const startTimer = () => {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => setIsHidden(true), 2000);
    };
    startTimer();
    const resetTimer = () => {
      clearTimeout(inactivityTimer.current);
      setIsHidden(false);
      inactivityTimer.current = setTimeout(() => setIsHidden(true), 2000);
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("scroll", resetTimer);
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      clearTimeout(inactivityTimer.current);
    };
  }, [isHome]);

  // ---- IntersectionObserver for normal scroll logic ----
  useEffect(() => {
    if (!isHome) { setIoReady(true); return; }
    const marker = document.querySelector("#portfolio-grid-top");
    if (!marker) { setIoReady(true); return; }

    const startObserver = () => {
      if (ioRef.current) ioRef.current.disconnect();
      ioRef.current = new IntersectionObserver(
        ([entry]) => {
          const past = entry.boundingClientRect.top <= navH();
          setIsPastGrid(past);
          pastGridRef.current = past;
          if (past && window.scrollY > lastY.current) setIsHidden(true);
          setIoReady(true);
        },
        { root: null, threshold: 0, rootMargin: `-${navH()}px 0px 0px 0px` }
      );
      ioRef.current.observe(marker);
    };
    startObserver();
    window.addEventListener("resize", startObserver);
    return () => {
      if (ioRef.current) ioRef.current.disconnect();
      window.removeEventListener("resize", startObserver);
    };
  }, [isHome]);

  // ---- scroll behavior ----
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (isHome && ioReady) {
        if (y > 1 && !pastGridRef.current) setIsHidden(false);
        if (pastGridRef.current && delta > 6) setIsHidden(true);
        if (delta < -40) setIsHidden(false);
      } else if (!isHome) {
        if (delta > 6) setIsHidden(true);
        if (delta < -8) setIsHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, ioReady]);

  // ---- mouse near top reveals ----
  useEffect(() => {
    if (!isHome) return;
    const onMove = (e) => { if (e.clientY < 80) setIsHidden(false); };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isHome]);

  const isActive = (p) => location.pathname === p;

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[90] bg-primary/95 backdrop-blur-xl border-b border-secondary/20
                  transition-transform duration-500 ease-out
                  ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="flex items-center justify-between h-16 px-8">
        <Link to="/" aria-label="Home"><img src={logoSmall} alt="Logo" className="h-10 w-auto" /></Link>
        <div ref={linksWrapRef} className="relative flex gap-8 text-base">
          <span
            className={`absolute bottom-0 h-[1px] bg-ink transition-[transform,width] duration-250 ease-[cubic-bezier(.22,.61,.36,1)]
                        ${ink.visible ? "opacity-100" : "opacity-0"}`}
            style={{ transform: `translateX(${ink.left}px)`, width: `${ink.width}px` }}
          />
          <Link ref={homeRef} to="/" className={`pb-1 font-['Phosphate-Inline'] ${isActive("/") ? "text-ink font-extrabold" : "text-ink/55 hover:text-accentWarm"}`}>HOME</Link>
          <Link ref={shopRef} to="/shop" className={`pb-1 font-['Phosphate-Inline'] ${isActive("/shop") ? "text-ink font-extrabold" : "text-ink/55 hover:text-accentWarm"}`}>SHOP</Link>
          <Link ref={contactRef} to="/contact" className={`pb-1 font-['Phosphate-Inline'] ${isActive("/contact") ? "text-ink font-extrabold" : "text-ink/55 hover:text-accentWarm"}`}>CONTACT</Link>
        </div>
      </div>
    </nav>
  );
}
