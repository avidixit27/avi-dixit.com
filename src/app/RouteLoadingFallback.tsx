export default function RouteLoadingFallback() {
  return (
    <div
      data-route-loading="true"
      role="status"
      aria-live="polite"
      className="page-container min-h-screen pt-page-content pb-20 font-inter text-text-muted sm:pt-page-content-sm sm:pb-24"
    >
      Loading page…
    </div>
  );
}
