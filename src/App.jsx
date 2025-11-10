import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';
import Navigation from './components/Navigation';

const LandingPage = lazy(() => import('./components/LandingPage'));
const Portfolio   = lazy(() => import('./components/Portfolio'));
const Shop        = lazy(() => import('./components/Shop'));

function App() {
  return (
    <Router>
      <NavigationProvider>
        <Navigation />
        <Suspense
          fallback={
            <div className="fixed inset-0 grid place-items-center text-ink/60">
              Loading…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </Suspense>
      </NavigationProvider>
    </Router>
  );
}

export default App;
