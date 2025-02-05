import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import logo from '../imgs/header/avi_dixit_logo.svg';

export default function Navigation() {
  const location = useLocation();
  const { navState, setPreviousPath, previousPath } = useNavigation();

  useEffect(() => {
    if (location.pathname !== previousPath) {
      setPreviousPath(location.pathname);
    }
  }, [location.pathname, setPreviousPath]);

  const baseClasses = "nav-link text-2xl font-['Phosphate-Inline'] text-black";

  const shouldShowNavLinks = navState === 'home';

  const getPortfolioClasses = () => {
    if (shouldShowNavLinks) {
      return `${baseClasses} ${previousPath === '/portfolio' ? 'returning' : ''}`;
    }
    return 'hidden';
  };

  const getShopClasses = () => {
    if (shouldShowNavLinks) {
      return `${baseClasses} ${previousPath === '/shop' ? 'returning' : ''}`;
    }
    return 'hidden';
  };

  const Logo = () => (
    <div className="w-[180px] shrink-0">
      <div className="pl-2">
        <Link 
          to="/" 
          className="flex items-center"
          onClick={() => setPreviousPath('/')}
        >
          <img src={logo} alt="Avid Photography Logo" className="h-20 w-auto" />
        </Link>
      </div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="py-6">
          {shouldShowNavLinks ? (
            <div className="h-20 flex justify-between items-center">
              <Logo />
              <div className="flex items-center gap-6 pr-2">
                <Link 
                  to="/portfolio" 
                  className={getPortfolioClasses()}
                  onClick={() => setPreviousPath(location.pathname)}
                >
                  Portfolio
                </Link>
                <Link 
                  to="/shop" 
                  className={getShopClasses()}
                  onClick={() => setPreviousPath(location.pathname)}
                >
                  Shop
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[180px_1fr_180px] h-20 items-center">
              <Logo />
              {location.pathname === '/portfolio' ? (
                <>
                  <div className="flex items-center justify-center">
                    <Link 
                      to="/portfolio" 
                      className="nav-link text-[3.5rem] font-['Phosphate-Inline'] text-black"
                      onClick={() => setPreviousPath(location.pathname)}
                    >
                      Portfolio
                    </Link>
                  </div>
                  <div className="flex items-center justify-end pr-2">
                    <Link 
                      to="/shop" 
                      className="nav-link text-2xl font-['Phosphate-Inline'] text-black opacity-50 hover:opacity-100 transition-opacity"
                      onClick={() => setPreviousPath(location.pathname)}
                    >
                      Shop
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center">
                    <Link 
                      to="/shop" 
                      className="nav-link text-[3.5rem] font-['Phosphate-Inline'] text-black"
                      onClick={() => setPreviousPath(location.pathname)}
                    >
                      Shop
                    </Link>
                  </div>
                  <div className="flex items-center justify-end pr-2">
                    <Link 
                      to="/portfolio" 
                      className="nav-link text-2xl font-['Phosphate-Inline'] text-black opacity-50 hover:opacity-100 transition-opacity"
                      onClick={() => setPreviousPath(location.pathname)}
                    >
                      Portfolio
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
