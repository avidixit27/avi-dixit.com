import { Link } from "react-router-dom";
import { ROUTES } from "../resources/navigation";

export default function NotFound() {
  return (
    <main className="reading-container flex min-h-screen items-center pt-16">
      <div className="mx-auto w-full max-w-[34rem] px-2 text-left sm:px-0">
        <p className="text-[clamp(0.875rem,2.5vw,1rem)] font-semibold tracking-[0.18em] text-brand-vivid uppercase">
          Lost in the archive
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.625rem,10vw,4.5rem)] leading-none font-semibold tracking-tight text-text">
          Page not found
        </h1>
        <p className="mt-6 max-w-2xl font-inter text-[clamp(1rem,3.5vw,1.25rem)] leading-8 text-text-muted">
          The page you requested is not part of this portfolio.
        </p>
        <Link
          to={ROUTES.home}
          className="mx-auto mt-10 flex w-fit rounded-control bg-brand-warm px-6 py-3 text-base font-semibold text-canvas transition-colors hover:bg-focus sm:px-8 sm:py-4 sm:text-lg"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
