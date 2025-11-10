export const prefetchRoute = (path) => {
    // match the lazy import paths above
    if (path === '/portfolio') import('../components/Portfolio');
    if (path === '/shop') import('../components/Shop');
  };