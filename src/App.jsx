import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';
import Navigation from './components/Navigation';

const Portfolio = lazy(() => import('./components/Portfolio')); // now home
const Shop = lazy(() => import('./components/Shop'));
const Contact = lazy(() => import('./components/Contact'));     // new

export default function App() {
  return (
    <Router>
      <NavigationProvider>
        <Navigation />
        <Suspense fallback={null}>
          <Routes>
            <Route
              path="/"
              element={
                <Portfolio
                  setHomePageFlag={() => {
                    document.body.dataset.page = "portfolio-home";
                  }}
                />
              }
            />

            <Route path="/shop" element={<Shop />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </NavigationProvider>
    </Router>
  );
}
