import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";
import MotionProvider from "./MotionProvider";
import Navigation from "./Navigation";
import RouteTransitionBoundary from "./RouteTransitionBoundary";

export default function App() {
  const [portfolioGridElement, setPortfolioGridElement] =
    useState<HTMLDivElement | null>(null);

  return (
    <MotionProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-panel text-text">
          <div className="relative z-10 min-h-screen bg-canvas shadow-[0_18px_40px_rgb(0_0_0_/_0.22)]">
            <Navigation portfolioGridElement={portfolioGridElement} />
            <RouteTransitionBoundary
              portfolioGridRef={setPortfolioGridElement}
            />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </MotionProvider>
  );
}
