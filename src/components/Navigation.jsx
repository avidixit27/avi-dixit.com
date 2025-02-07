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

  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary z-50">
      <div className="py-6">
        <div className="h-20 relative">
          {/* Fixed Logo */}
          <div className="fixed top-6 left-8 z-50 w-[180px]">
            <Link 
              to="/"
              className="flex items-center"
              onClick={() => setPreviousPath('/')}
            >
              <img src={logo} alt="Avid Photography Logo" className="h-20 w-auto" />
            </Link>
          </div>

          {shouldShowNavLinks ? (
            <div className="flex items-center justify-end h-full">
              <div className="fixed top-6 right-8 h-20 flex items-center gap-6">
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
            <>
              <div className="flex items-center justify-center h-full">
                {location.pathname === '/portfolio' ? (
                  <Link 
                    to="/portfolio" 
                    className="nav-link text-[3.5rem] font-['Phosphate-Inline'] text-black"
                    onClick={() => setPreviousPath(location.pathname)}
                  >
                    Portfolio
                  </Link>
                ) : (
                  <Link 
                    to="/shop" 
                    className="nav-link text-[3.5rem] font-['Phosphate-Inline'] text-black"
                    onClick={() => setPreviousPath(location.pathname)}
                  >
                    Shop
                  </Link>
                )}
              </div>
              <div className="fixed top-6 right-8 h-20 flex items-center">
                {location.pathname === '/portfolio' ? (
                  <Link 
                    to="/shop" 
                    className="nav-link text-2xl font-['Phosphate-Inline'] text-black opacity-50 hover:opacity-100 transition-opacity"
                    onClick={() => setPreviousPath(location.pathname)}
                  >
                    Shop
                  </Link>
                ) : (
                  <Link 
                    to="/portfolio" 
                    className="nav-link text-2xl font-['Phosphate-Inline'] text-black opacity-50 hover:opacity-100 transition-opacity"
                    onClick={() => setPreviousPath(location.pathname)}
                  >
                    Portfolio
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
