import { Link } from "react-router-dom";
import { ROUTES } from "../resources/navigation";

export default function NotFound() {
  return (
    <main className="page-container min-h-screen pt-page-content pb-20 sm:pt-page-content-sm sm:pb-24">
      <p className="text-sm font-semibold tracking-[0.18em] text-brand-vivid uppercase">
        Lost in the archive
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-5xl">
        Page not found
      </h1>
      <p className="mt-5 max-w-xl font-inter text-base leading-7 text-text-muted sm:text-lg">
        The page you requested is not part of this portfolio.
      </p>
      <Link
        to={ROUTES.home}
        className="mt-8 inline-flex rounded-control bg-brand-warm px-5 py-3 font-semibold text-canvas transition-colors hover:bg-focus"
      >
        Return home
      </Link>
    </main>
  );
}
