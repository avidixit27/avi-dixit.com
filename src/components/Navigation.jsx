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

  const baseClasses = "nav-link text-[3rem] font-['Phosphate-Inline'] text-black";

  const getPortfolioClasses = () => {
    switch (navState) {
      case 'home':
        return `${baseClasses} returning`;
      case 'portfolio-from-home':
      case 'portfolio-from-shop':
        return `${baseClasses} active text-accentWarm`;
      case 'shop-from-portfolio':
      case 'shop-from-home':
        return `${baseClasses} behind`;
      default:
        return baseClasses;
    }
  };

  const getShopClasses = () => {
    switch (navState) {
      case 'home':
        return `${baseClasses} returning`;
      case 'portfolio-from-home':
      case 'portfolio-from-shop':
        return `${baseClasses} behind`;
      case 'shop-from-portfolio':
      case 'shop-from-home':
        return `${baseClasses} active text-accentWarm`;
      default:
        return baseClasses;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary z-50">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center transition-transform duration-300 hover:scale-105"
            onClick={() => setPreviousPath('/')}
          >
            <img src={logo} alt="Avid Photography Logo" className="h-20 w-auto" />
          </Link>
          <div className="flex-1 flex justify-end relative overflow-visible nav-container">
            <div className="flex items-center gap-8 mr-8 nav-link-wrapper">
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
        </div>
      </div>
    </nav>
  );
}