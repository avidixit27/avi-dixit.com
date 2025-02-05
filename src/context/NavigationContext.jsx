import { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState('/');

  const getNavState = () => {
    switch (location.pathname) {
      case '/':
        return 'home';
      case '/portfolio':
        return previousPath === '/' ? 'portfolio-from-home' : 'portfolio-from-shop';
      case '/shop':
        return previousPath === '/' ? 'shop-from-home' : 'shop-from-portfolio';
      default:
        return 'home';
    }
  };

  const value = {
    navState: getNavState(),
    setPreviousPath,
    previousPath
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}