export default function RouteLoadingFallback({
  showImageSkeleton = false,
}: {
  showImageSkeleton?: boolean;
}) {
  return (
    <div
      data-route-loading="true"
      role="status"
      aria-live="polite"
      className={`relative grid min-h-svh place-items-center overflow-hidden font-inter text-text-muted ${showImageSkeleton ? "image-skeleton" : ""}`}
    >
      <span className="relative">Loading page…</span>
    </div>
  );
}
