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
      <div className="flex min-h-screen flex-col bg-canvas text-text">
        <Navigation portfolioGridElement={portfolioGridElement} />
        <div className="flex-1">
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
