import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import logo from '../imgs/header/avi_dixit_logo.svg';
import downArrow from '../imgs/icons/down_arrow.svg';

export default function Navigation() {
  const location = useLocation();
  const { navState, setPreviousPath, previousPath } = useNavigation();
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    const handleResize = (e) => {
      setIsSingleColumn(!e.matches);
      if (e.matches) {
        setIsMenuOpen(false);
      }
    };

    handleResize(mediaQuery);
    mediaQuery.addEventListener('change', handleResize);

    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname !== previousPath) {
      setPreviousPath(location.pathname);
      setIsMenuOpen(false);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary z-50 min-w-[600px]">
      <div className="py-6">
        <div className="h-20 relative">
          {shouldShowNavLinks ? (
            <div className="flex justify-between items-center h-full px-8">
              <div className="w-[272px] flex justify-start pr-[0.1rem]">
                <Link 
                  to="/"
                  className="flex items-center"
                  onClick={() => setPreviousPath('/')}
                >
                  <img src={logo} alt="Avid Photography Logo" className="h-20 w-auto" />
                </Link>
              </div>
              <div className="flex items-center gap-6">
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
            <div className="flex justify-between h-full px-8">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/"
                  className="flex items-center"
                  onClick={() => setPreviousPath('/')}
                >
                  <img src={logo} alt="Avid Photography Logo" className="h-20 w-auto" />
                </Link>
                {isSingleColumn && (
                  <div className="relative">
                    <button 
                      onClick={toggleMenu}
                      className="w-8 h-8 flex items-center justify-center"
                      aria-label="Toggle navigation menu"
                    >
                      <img 
                        src={downArrow} 
                        alt="Menu" 
                        className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px]">
                        {location.pathname === '/portfolio' ? (
                          <>
                            <Link 
                              to="/portfolio" 
                              className="block px-4 py-2 text-[2rem] font-['Phosphate-Inline'] text-black hover:bg-gray-100"
                              onClick={() => setPreviousPath(location.pathname)}
                            >
                              Portfolio
                            </Link>
                            <Link 
                              to="/shop" 
                              className="block px-4 py-2 text-xl font-['Phosphate-Inline'] text-black opacity-50 hover:opacity-100 hover:bg-gray-100"
                              onClick={() => setPreviousPath(location.pathname)}
                            >
                              Shop
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link 
                              to="/shop" 
                              className="block px-4 py-2 text-[2rem] font-['Phosphate-Inline'] text-black hover:bg-gray-100"
                              onClick={() => setPreviousPath(location.pathname)}
                            >
                              Shop
                            </Link>
                            <Link 
                              to="/portfolio" 
                              className="block px-4 py-2 text-xl font-['Phosphate-Inline'] text-black opacity-50 hover:opacity-100 hover:bg-gray-100"
                              onClick={() => setPreviousPath(location.pathname)}
                            >
                              Portfolio
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!isSingleColumn && (
                <>
                  <div className="flex-1 flex justify-center pl-[0.1rem] translate-x-50">
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
                  <div className="w-[272px] flex items-center justify-end pl-[0.1rem]">
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
          )}
        </div>
      </div>
    </nav>
  );
}
