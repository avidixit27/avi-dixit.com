import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import logo from '../imgs/header/avi_dixit_logo.svg';
import downArrow from '../imgs/icons/down_arrow.svg';

export default function Navigation() {
  const location = useLocation();
  const { navState, setPreviousPath, previousPath } = useNavigation();
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Smart header state
  const [isHidden, setIsHidden] = useState(false);
  const [isShowingFast, setIsShowingFast] = useState(false); // controls 150ms vs 500ms
  const lastYRef = useRef(0);

  // Thresholds (in px)
  const hidePxRef = useRef(0); // when to hide
  const showPxRef = useRef(4); // when to show (top only, small jitter allowed)

  // Measure nav + compute thresholds per route
  const navRef = useRef(null);

  const remToPx = (rem) =>
    parseFloat(getComputedStyle(document.documentElement).fontSize) * rem;

  const computeThresholds = () => {
    const navH = navRef.current ? navRef.current.getBoundingClientRect().height : 0;

    // default behavior for non-portfolio pages: hide after ~16rem
    let hideAtPx = remToPx(16);

    if (location.pathname === '/portfolio') {
      // Hide the instant the grid touches the top (accounting for nav height)
      const grid =
        document.querySelector('#portfolio-grid-top') ||
        document.querySelector('[data-portfolio-grid]');
      if (grid) {
        const topAbs = grid.getBoundingClientRect().top + window.scrollY;
        hideAtPx = Math.max(0, topAbs - navH);
      }
    }

    hidePxRef.current = hideAtPx;
    showPxRef.current = 8; // reappear when within 8px of the very top
  };

  // Init / on resize / on route change
  useEffect(() => {
    computeThresholds();
    const onResize = () => computeThresholds();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Switch to single column below md
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => {
      setIsSingleColumn(!e.matches);
      if (e.matches) setIsMenuOpen(false);
    };
    onChange(mq);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    if (location.pathname !== previousPath) {
      setPreviousPath(location.pathname);
      setIsMenuOpen(false);
      requestAnimationFrame(() => computeThresholds());
    }
  }, [location.pathname, setPreviousPath]);

  // Scroll behavior:
  // - Hide when y >= hidePx
  // - Show ONLY when y <= showPx (top of page), with snappy 150ms
  useEffect(() => {
    lastYRef.current = window.scrollY || 0;

    const onScroll = () => {
      const y = window.scrollY || 0;

      if (y <= showPxRef.current) {
        if (isHidden) {
          setIsShowingFast(true);  // reappear quickly at top
          setIsHidden(false);
        }
      } else if (y >= hidePxRef.current) {
        if (!isHidden) {
          setIsShowingFast(false); // hide gracefully
          setIsHidden(true);
        }
      }

      lastYRef.current = y;
    };

    requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHidden]);

  const baseClasses = "nav-link text-2xl font-['Phosphate-Inline'] text-black";
  const shouldShowNavLinks = navState === 'home';

  const getPortfolioClasses = () =>
    shouldShowNavLinks ? `${baseClasses} ${previousPath === '/portfolio' ? 'returning' : ''}` : 'hidden';

  const getShopClasses = () =>
    shouldShowNavLinks ? `${baseClasses} ${previousPath === '/shop' ? 'returning' : ''}` : 'hidden';

  const getHomeLinkClasses = () =>
    !shouldShowNavLinks ? `${baseClasses} ${previousPath === '/' ? 'returning' : ''}` : 'hidden';

  const toggleMenu = () => setIsMenuOpen((s) => !s);

  // Apple-soft: use a softer curve when appearing, a graceful curve when hiding
  // Tailwind supports custom cubic-bezier via arbitrary values in the ease-[] class.
  const easingClass = isShowingFast
    ? "ease-[cubic-bezier(.22,.61,.36,1)]" // soft, quick settle when showing
    : "ease-[cubic-bezier(.4,0,.2,1)]";    // standard smooth when hiding

  const durationClass = isShowingFast ? "duration-150" : "duration-500";

  return (
    <nav
      ref={navRef}
      className={`
        fixed top-0 left-0 right-0 bg-primary z-50 min-w-[600px]
        will-change-transform
        transition-all ${durationClass} ${easingClass} motion-reduce:transition-none
        ${isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}
    >
      <div className="py-6">
        <div className="h-20 relative">
          {shouldShowNavLinks ? (
            <div className="flex justify-between items-center h-full px-8">
              <div className="w-[272px] flex justify-start">
                <Link to="/" onClick={() => setPreviousPath(location.pathname)}>
                  <img className="w-[272px] h-[65px]" src={logo} alt="Avi Dixit logo" />
                </Link>
              </div>

              {/* Desktop nav (>= md) */}
              {!isSingleColumn && (
                <div className="flex items-center gap-12">
                  <Link
                    to="/portfolio"
                    className={getPortfolioClasses()}
                    onClick={() => setPreviousPath(location.pathname)}
                  >
                    PORTFOLIO
                  </Link>
                  <Link
                    to="/shop"
                    className={getShopClasses()}
                    onClick={() => setPreviousPath(location.pathname)}
                  >
                    SHOP
                  </Link>
                </div>
              )}

              {/* Mobile nav (< md) */}
              {isSingleColumn && (
                <>
                  <button
                    aria-label="Open menu"
                    onClick={toggleMenu}
                    className="absolute right-8 top-1/2 -translate-y-1/2"
                  >
                    <img
                      src={downArrow}
                      alt="Menu"
                      className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px]">
                      <Link
                        to="/portfolio"
                        className="block px-4 py-2 text-right text-2xl font-['Phosphate-Inline'] text-black hover:bg-gray-100"
                        onClick={() => setPreviousPath(location.pathname)}
                      >
                        Portfolio
                      </Link>
                      <Link
                        to="/shop"
                        className="block px-4 py-2 text-right text-2xl font-['Phosphate-Inline'] text-black hover:bg-gray-100"
                        onClick={() => setPreviousPath(location.pathname)}
                      >
                        Shop
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // Non-home pages
            <div className="flex justify-between items-center h-full px-8">
              <div className="w-[272px] flex justify-start">
                <Link to="/" className={getHomeLinkClasses()} onClick={() => setPreviousPath(location.pathname)}>
                  HOME
                </Link>
              </div>
              <div className="flex-1 flex justify-center">
                <Link to="/" onClick={() => setPreviousPath(location.pathname)}>
                  <img className="w-[272px] h-[65px]" src={logo} alt="Avi Dixit logo" />
                </Link>
              </div>
              <div className="w-[272px]" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
