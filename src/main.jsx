import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function Root() {
  useEffect(() => {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--sbw', `${sbw}px`);
    // update on resize to be safe
    const onResize = () => {
      const w = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--sbw', `${w}px`);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
