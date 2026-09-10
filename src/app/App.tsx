import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "../resources/navigation";
import Footer from "./Footer";
import Navigation from "./Navigation";

const Portfolio = lazy(() => import("../features/portfolio/Portfolio"));
const Shop = lazy(() => import("../features/shop/Shop"));
const Contact = lazy(() => import("../features/inquiries/Contact"));

export default function App() {
  const [portfolioGridElement, setPortfolioGridElement] =
    useState<HTMLDivElement | null>(null);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-panel text-text">
        <div className="relative z-10 min-h-screen bg-canvas shadow-[0_18px_40px_rgb(0_0_0_/_0.22)] lg:mb-52">
          <Navigation portfolioGridElement={portfolioGridElement} />
          <Suspense fallback={null}>
            <Routes>
              <Route
                path={ROUTES.home}
                element={<Portfolio gridMarkerRef={setPortfolioGridElement} />}
              />
              <Route path={ROUTES.shop} element={<Shop />} />
              <Route path={ROUTES.contact} element={<Contact />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
