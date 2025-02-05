import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';
import LandingPage from './components/LandingPage';
import Portfolio from './components/Portfolio';
import Shop from './components/Shop';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <NavigationProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </NavigationProvider>
    </Router>
  );
}

export default App;