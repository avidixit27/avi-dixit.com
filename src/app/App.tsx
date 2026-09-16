import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";
import { FEATURE_AVAILABILITY } from "./featureAvailability";
import MotionProvider from "./MotionProvider";
import Navigation from "./Navigation";
import RouteTransitionBoundary from "./RouteTransitionBoundary";

export default function App() {
  const [portfolioGridElement, setPortfolioGridElement] =
    useState<HTMLDivElement | null>(null);
  const [isHomeResetActive, setIsHomeResetActive] = useState(false);

  return (
    <MotionProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-panel text-text">
          <div className="relative z-10 min-h-screen bg-canvas shadow-[0_18px_40px_rgb(0_0_0_/_0.22)]">
            <Navigation
              availability={FEATURE_AVAILABILITY}
              portfolioGridElement={portfolioGridElement}
              onHomeResetStart={() => setIsHomeResetActive(true)}
              onHomeResetEnd={() => setIsHomeResetActive(false)}
            />
            <RouteTransitionBoundary
              availability={FEATURE_AVAILABILITY}
              portfolioGridRef={setPortfolioGridElement}
            />
          </div>
          <Footer landingEnabled={!isHomeResetActive} />
        </div>
      </BrowserRouter>
    </MotionProvider>
  );
}
