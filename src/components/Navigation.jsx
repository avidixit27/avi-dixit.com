import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import logo from '../imgs/header/avi_dixit_logo.svg';
import downArrow from '../imgs/icons/down_arrow.svg';

export default function Navigation() {
  const location = useLocation();
  const { setPreviousPath, previousPath } = useNavigation();

  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isHidden, setIsHidden] = useState(false);
  const [isShowingFast, setIsShowingFast] = useState(false);

  const navRef = useRef(null);
  const hidePxRef = useRef(0);
  const showPxRef = useRef(8);

  const linksWrapRef = useRef(null);
  const portfolioRef = useRef(null);
  const shopRef = useRef(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, ready: false });

  const remToPx = (rem) =>
    parseFloat(getComputedStyle(document.documentElement).fontSize) * rem;

  const computeThresholds = () => {
    const navH = navRef.current
      ? navRef.current.getBoundingClientRect().height
      : 0;

    let hideAtPx = remToPx(16);

    if (location.pathname === '/portfolio') {
      const grid =
        document.querySelector('#portfolio-grid-top') ||
        document.querySelector('[data-portfolio-grid]');
      if (grid) {
        const topAbs = grid.getBoundingClientRect().top + window.scrollY;
        hideAtPx = Math.max(0, topAbs - navH);
      }
    }

    hidePxRef.current = hideAtPx;
    showPxRef.current = 8;
  };

  const computeIndicator = () => {
    const wrap = linksWrapRef.current;
    if (!wrap) return;

    const activeRef =
      location.pathname === '/shop'
        ? shopRef.current
        : location.pathname === '/portfolio'
        ? portfolioRef.current
        : null;

    if (!activeRef) {
      setIndicator((prev) => ({ ...prev, ready: false }));
      return;
    }

    const wrapRect = wrap.getBoundingClientRect();
    const linkRect = activeRef.getBoundingClientRect();
    const x = linkRect.left - wrapRect.left;
    const w = linkRect.width;

    setIndicator({ x, w, ready: true });
  };

  useEffect(() => {
    computeThresholds();
    computeIndicator();

    const onResize = () => {
      computeThresholds();
      requestAnimationFrame(computeIndicator);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => {
      setIsSingleColumn(!e.matches);
      if (e.matches) setIsMenuOpen(false);
      requestAnimationFrame(computeIndicator);
    };
    onChange(mq);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (location.pathname !== previousPath) {
      setPreviousPath(location.pathname);
      setIsMenuOpen(false);
      requestAnimationFrame(computeIndicator);
    }
  }, [location.pathname, setPreviousPath]);

  useEffect(() => {
    const onScroll = () => {
      if (document.documentElement.classList.contains('modal-open')) return;
      const y = window.scrollY || 0;

      if (y <= showPxRef.current) {
        if (isHidden) {
          setIsShowingFast(true);
          setIsHidden(false);
        }
      } else if (y >= hidePxRef.current) {
        if (!isHidden) {
          setIsShowingFast(false);
          setIsHidden(true);
        }
      }
    };

    requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHidden]);

  // Typography & sizing (Option B)
  const linkBase = "text-lg tracking-wider font-['Phosphate-Inline']";
  const isShop = location.pathname === '/shop';
  const isPortfolio = location.pathname === '/portfolio';

  const portfolioClasses = `${linkBase} ${
    isPortfolio
      ? 'text-black opacity-90 font-extrabold'
      : 'text-black/45 hover:text-black/80'
  }`;

  const shopClasses = `${linkBase} ${
    isShop
      ? 'text-black opacity-90 font-extrabold'
      : 'text-black/45 hover:text-black/80'
  }`;

  const easingClass = isShowingFast
    ? 'ease-[cubic-bezier(.22,.61,.36,1)]'
    : 'ease-[cubic-bezier(.4,0,.2,1)]';

  const durationClass = isShowingFast ? 'duration-150' : 'duration-500';

  return (
    <nav
      ref={navRef}
      className={`
        fixed top-0 left-0 right-0 bg-primary z-50 min-w-[600px]
        will-change-transform transition-all ${durationClass} ${easingClass}
        motion-reduce:transition-none
        ${isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}
    >
      <div className="py-2">
        <div className="h-14 relative">
          <div className="flex justify-between items-center h-full px-8">

            {/* Logo */}
            <div className="w-[180px] flex justify-start">
              <Link to="/">
                <img className="w-[160px] h-[40px]" src={logo} alt="Avi Dixit logo" />
              </Link>
            </div>

            {/* Desktop Links */}
            {!isSingleColumn && (
              <div ref={linksWrapRef} className="relative flex items-center gap-10 pb-[2px]">
                <Link ref={portfolioRef} to="/portfolio" className={portfolioClasses}>
                  PORTFOLIO
                </Link>
                <Link ref={shopRef} to="/shop" className={shopClasses}>
                  SHOP
                </Link>

                {/* underline hidden on home */}
                {indicator.ready && location.pathname !== '/' && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 h-[1px] rounded bg-black/80 transition-all duration-250 ease-[cubic-bezier(.22,.61,.36,1)]"
                    style={{
                      width: `${indicator.w}px`,
                      transform: `translateX(${indicator.x}px)`
                    }}
                  />
                )}
              </div>
            )}

            {/* Mobile Menu */}
            {isSingleColumn && (
              <>
                <button
                  aria-label="Open menu"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                      onMouseEnter={() => prefetchRoute('/portfolio')}
                      className="block px-4 py-2 text-right text-lg font-['Phosphate-Inline'] text-black/75 hover:text-black"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Portfolio
                    </Link>
                    <Link
                      to="/shop"
                      onMouseEnter={() => prefetchRoute('/shop')}
                      className="block px-4 py-2 text-right text-lg font-['Phosphate-Inline'] text-black/75 hover:text-black"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Shop
                    </Link>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
