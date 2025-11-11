import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSmall from "../imgs/header/avi_dixit_logo.svg";

/**
 * Nav behavior (Option A):
 * - On Home (/): start hidden; reveal on small scroll OR mouse near top.
 * - Once you scroll into the portfolio grid, nav hides and stays hidden while scrolling down.
 * - Shows when scrolling up or when mouse touches top edge (within 80px).
 * - Exposes two CSS vars:
 *    --nav-h  : actual nav height in px
 *    --nav-pt : 0 when hidden, --nav-h when shown (so fullscreen padding is correct)
 */
export default function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navRef = useRef(null);
  const [isHidden, setIsHidden] = useState(isHome); // hidden by default on Home
  const lastY = useRef(0);
  const pastGridRef = useRef(false); // whether the grid-top marker has crossed the top

  // ---- CSS vars for height + padding control ----
  const setNavVars = () => {
    const h = navRef.current?.offsetHeight ?? 64;
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
    document.documentElement.style.setProperty("--nav-pt", isHidden ? "0px" : `${h}px`);
  };

  useLayoutEffect(() => { setNavVars(); }, []);
  useEffect(() => {
    setNavVars();
    const onResize = () => setNavVars();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isHidden, location.pathname]);

  // ---- Observe #portfolio-grid-top to know when we've left the hero ----
  useEffect(() => {
    if (!isHome) { pastGridRef.current = true; return; }

    const marker = document.querySelector("#portfolio-grid-top");
    if (!marker) { pastGridRef.current = false; return; }

    const io = new IntersectionObserver(
      (entries) => {
        // When the marker hits the top, it stops intersecting the viewport top edge
        entries.forEach((e) => {
          // We consider "past grid" when the marker's top is at/above the nav line.
          pastGridRef.current = e.boundingClientRect.top <= (navRef.current?.offsetHeight ?? 64);
        });
      },
      { rootMargin: "0px 0px 0px 0px", threshold: [0] }
    );
    io.observe(marker);
    return () => io.disconnect();
  }, [isHome]);

  // ---- Scroll-driven hide/show with hysteresis ----
  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      // Reveal triggers (home only)
      if (isHome) {
        if (y > 1) setIsHidden(false); // small nudge reveals
      }

      // Hysteresis:
      // - If we're past the hero (pastGridRef true) and scrolling down, stay hidden.
      // - Show on scroll up by a decent amount.
      if (delta > 6) {
        if (pastGridRef.current) setIsHidden(true);
      } else if (delta < -8) {
        setIsHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // ---- Mouse near top reveals nav (home only) ----
  useEffect(() => {
    if (!isHome) return;
    const onMove = (e) => { if (e.clientY < 80) setIsHidden(false); };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isHome]);

  // Keep CSS vars in sync whenever state flips
  useEffect(() => { setNavVars(); }, [isHidden]);

  const isActive = (path) => location.pathname === path;

  const linkBase =
    "relative pb-1 font-['Phosphate-Inline'] tracking-wide transition-colors select-none";
  const linkClasses = (active) =>
    `${linkBase} ${active ? "text-ink font-extrabold" : "text-ink/55 hover:text-accentWarm"}`;

  const Underline = ({ active }) => (
    <span
      className={`absolute -bottom-0.5 left-0 h-[1px] bg-ink transition-transform duration-250 ease-out ${
        active ? "w-full scale-x-100" : "w-full scale-x-0"
      }`}
      style={{ transformOrigin: "left" }}
      aria-hidden="true"
    />
  );

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[90] bg-primary/95 backdrop-blur-xl border-b border-secondary/20
                  transition-transform duration-500 ease-out
                  ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="flex items-center justify-between h-16 px-8">
        <Link to="/" aria-label="Home">
          <img src={logoSmall} alt="Logo" className="h-10 w-auto" />
        </Link>

        <div className="flex gap-8 text-base">
          <Link to="/" className={linkClasses(isActive("/"))}>
            HOME
            <Underline active={isActive("/")} />
          </Link>
          <Link to="/shop" className={linkClasses(isActive("/shop"))}>
            SHOP
            <Underline active={isActive("/shop")} />
          </Link>
          <Link to="/contact" className={linkClasses(isActive("/contact"))}>
            CONTACT
            <Underline active={isActive("/contact")} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
