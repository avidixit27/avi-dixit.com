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

  // On home: visible at first, then auto-hide after ~2s inactivity
  const [isHidden, setIsHidden] = useState(false);
  const isHiddenRef = useRef(isHidden);

  const [isPastGrid, setIsPastGrid] = useState(false);
  const pastGridRef = useRef(false);
  const [ioReady, setIoReady] = useState(true); // allow logic immediately; IO refines it when ready
  const lastY = useRef(0);
  const ioRef = useRef(null);
  const inactivityTimer = useRef(null);
  const scrollingTimer = useRef(null);

  const navH = () => navRef.current?.offsetHeight ?? 64;
  const setNavVars = () => {
    const h = navH();
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
    document.documentElement.style.setProperty("--nav-pt", isHiddenRef.current ? "0px" : `${h}px`);
  };

  useEffect(() => { isHiddenRef.current = isHidden; setNavVars(); }, [isHidden]);
  useLayoutEffect(() => { setNavVars(); }, []);

  /* ========== Sliding underline indicator ========== */
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
    if (!wrap || !el) { setInk((p) => ({ ...p, visible: false })); return; }
    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setInk({ left: elRect.left - wrapRect.left, width: elRect.width, visible: true });
  };
  useEffect(() => {
    const id = requestAnimationFrame(positionIndicator);
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  /* ========== 2s auto-hide on initial load (home only) ========== */
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
    window.addEventListener("mousemove", resetTimer, { passive: true });
    window.addEventListener("scroll", resetTimer, { passive: true });
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      clearTimeout(inactivityTimer.current);
    };
  }, [isHome]);

  /* ========== IntersectionObserver drives 'past grid' state when marker is ready ========== */
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

  /* ========== Scroll behavior with hysteresis ========== */
  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      clearTimeout(scrollingTimer.current);
      scrollingTimer.current = setTimeout(() => {
        document.body.classList.remove("scrolling");
        document.documentElement.classList.remove("scrolling");
      }, 1000);

      const y = window.scrollY;
      const delta = y - lastY.current;

      // === Custom draggable scroll thumb ===
      const scrollBar = document.getElementById("custom-scrollbar");
      if (scrollBar) {
        const thumbHeight = scrollBar.offsetHeight || 80;
        const doc = document.documentElement;
        const scrollHeight = doc.scrollHeight - window.innerHeight;
        const trackHeight = Math.max(window.innerHeight - thumbHeight, 0);

        // Position thumb based on scroll progress
        const progress = scrollHeight > 0 ? y / scrollHeight : 0;
        const top = progress * trackHeight;
        scrollBar.style.top = `${top}px`;

        // Only auto-fade if we're not dragging
        if (scrollBar.dataset.dragging !== "true") {
          scrollBar.style.opacity = "1";
        
          clearTimeout(scrollBar._hideTimer);
          scrollBar._hideTimer = setTimeout(() => {
            scrollBar.style.opacity = "0";
          }, 1200);
        }
      }

      if (isHome && ioReady) {
        // === ABOVE the grid (hero region) ===
        // We do *not* hide based on small downward scroll here.
        // The only things that affect visibility here are:
        // - the 2s inactivity timer
        // - strong upward scroll (to force show)
        if (y > 1 && !pastGridRef.current) {
          // As soon as we start scrolling down a bit, ensure nav is allowed to show
          setIsHidden(false);
        }

        if (delta < -40) {
          // Strong scroll up: force show header
          setIsHidden(false);
        }
      } else if (!isHome) {
        // Non-home pages: simple show/hide by direction
        if (delta > 6) setIsHidden(true);
        if (delta < -8) setIsHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollingTimer.current);
    };
  }, [isHome, ioReady]);

  /* ========== Draggable custom scrollbar ========== */
  useEffect(() => {
    const scrollBar = document.getElementById("custom-scrollbar");
    if (!scrollBar) return;

    let isDragging = false;
    let dragOffsetY = 0;

    const doc = document.documentElement;

    const startDrag = (clientY) => {
      isDragging = true;
      scrollBar.dataset.dragging = "true";
      scrollBar.classList.add("dragging");
      scrollBar.style.opacity = "1";

      const rect = scrollBar.getBoundingClientRect();
      dragOffsetY = clientY - rect.top;
    };

    const onMouseDown = (e) => {
      e.preventDefault();
      startDrag(e.clientY);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const thumbHeight = scrollBar.offsetHeight || 80;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      const trackHeight = Math.max(window.innerHeight - thumbHeight, 0);

      let newTop = e.clientY - dragOffsetY;
      if (newTop < 0) newTop = 0;
      if (newTop > trackHeight) newTop = trackHeight;
      scrollBar.style.top = `${newTop}px`;

      const progress = trackHeight > 0 ? newTop / trackHeight : 0;
      const newScrollY = progress * scrollHeight;
      window.scrollTo({ top: newScrollY, behavior: "auto" });
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      scrollBar.dataset.dragging = "false";
      scrollBar.classList.remove("dragging");

      // fade out after a bit
      clearTimeout(scrollBar._hideTimer);
      scrollBar._hideTimer = setTimeout(() => {
        scrollBar.style.opacity = "0";
      }, 700);
    };

    scrollBar.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);

    return () => {
      scrollBar.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
    };
  }, []);


  /* ========== Mouse near top reveals (home) ========== */
  useEffect(() => {
    if (!isHome) return;
    const onMove = (e) => {
      // Only allow this if we are NOT past the grid marker
      if (!pastGridRef.current && e.clientY < 80) {
        setIsHidden(false);
      }
    };
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

        {/* Links + moving ink underline */}
        <div ref={linksWrapRef} className="relative flex gap-8 text-base">
          <span
            className={`absolute bottom-0 h-[1px] bg-ink transition-[transform,width] duration-250 ease-[cubic-bezier(.22,.61,.36,1)]
                        ${ink.visible ? "opacity-100" : "opacity-0"}`}
            style={{ transform: `translateX(${ink.left}px)`, width: `${ink.width}px` }}
            aria-hidden="true"
          />
          <Link ref={homeRef} to="/" className={`pb-1 font-['Phosphate-Inline'] ${isActive("/") ? "text-ink font-extrabold" : "text-ink/55 hover:text-accentWarm"}`}>HOME</Link>
          <Link ref={shopRef} to="/shop" className={`pb-1 font-['Phosphate-Inline'] ${isActive("/shop") ? "text-ink font-extrabold" : "text-ink/55 hover:text-accentWarm"}`}>SHOP</Link>
          <Link ref={contactRef} to="/contact" className={`pb-1 font-['Phosphate-Inline'] ${isActive("/contact") ? "text-ink font-extrabold" : "text-ink/55 hover:text-accentWarm"}`}>CONTACT</Link>
        </div>
      </div>
    </nav>
  );
}
