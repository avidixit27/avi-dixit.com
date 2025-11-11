import { useEffect, useMemo, useRef, useState } from "react";
import BlurImage from "./BlurImage";

export default function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [fadeKey, setFadeKey] = useState(0);

  // ---- Load images (your set is .JPG) ----
  useEffect(() => {
    const files = import.meta.glob("../imgs/portfolio/*.JPG", { eager: true });
    const arr = Object.values(files).map((m, i) => ({
      id: i,
      src: m.default,
      alt: `Photo ${i + 1}`,
    }));
    arr.sort((a, b) => a.id - b.id);
    setPhotos(arr);
  }, []);

  // ---- Preload to reduce scroll/FS hitching ----
  useEffect(() => {
    photos.forEach((p) => {
      const img = new Image();
      img.src = p.src;
    });
  }, [photos]);

  // ---- Hero slideshow (top of Home) ----
  const hero = useMemo(() => photos.slice(0, 8), [photos]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!hero.length) return;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % hero.length), 5000);
    return () => clearInterval(id);
  }, [hero.length]);

  // ---- Build a landscape-only index for carousel rotation ----
  const [landscapeIndices, setLandscapeIndices] = useState([]);
  const aspectCache = useRef({});

  const isLandscape = (src) =>
    new Promise((resolve) => {
      if (src in aspectCache.current) return resolve(aspectCache.current[src]);
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const ok = img.width > img.height * 1.2; // "rectangular enough"
        aspectCache.current[src] = ok;
        resolve(ok);
      };
    });

  useEffect(() => {
    let mounted = true;
    const compute = async () => {
      const indices = [];
      for (let i = 0; i < photos.length; i++) {
        // precompute aspect for carousel
        const ok = await isLandscape(photos[i].src);
        if (!mounted) return;
        if (ok) indices.push(i);
      }
      if (mounted) setLandscapeIndices(indices);
    };
    if (photos.length) compute();
    return () => {
      mounted = false;
    };
  }, [photos]);

  // ---- Open/close fullscreen (ALL images open; portrait allowed) ----
  const openFullscreen = (idx) => {
    document.documentElement.classList.add("modal-open");
    setSelectedIndex(idx);
    setFadeKey((k) => k + 1);
  };

  const closeFullscreen = () => {
    setSelectedIndex(null);
    document.documentElement.classList.remove("modal-open");
  };

  // ---- Keyboard nav uses landscape-only rotation ----
  useEffect(() => {
    const onKey = (e) => {
      if (selectedIndex == null) return;

      if (e.key === "Escape") closeFullscreen();

      if (e.key === "ArrowRight") {
        const cur = selectedIndex;
        const pos = landscapeIndices.indexOf(cur);
        const next =
          pos === -1
            ? landscapeIndices.find((i) => i > cur) ?? landscapeIndices[0]
            : landscapeIndices[(pos + 1) % landscapeIndices.length];
        if (next != null) {
          setSelectedIndex(next);
          setFadeKey((k) => k + 1);
        }
      }

      if (e.key === "ArrowLeft") {
        const cur = selectedIndex;
        const pos = landscapeIndices.indexOf(cur);
        const prev =
          pos === -1
            ? landscapeIndices.filter((i) => i < cur).pop() ??
              landscapeIndices[landscapeIndices.length - 1]
            : landscapeIndices[
                (pos - 1 + landscapeIndices.length) % landscapeIndices.length
              ];
        if (prev != null) {
          setSelectedIndex(prev);
          setFadeKey((k) => k + 1);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, landscapeIndices]);

  // ---- Render ----
  return (
    <div className="bg-primary min-h-screen">
      {/* HERO */}
      {hero.length > 0 && (
        <div className="relative h-[100svh] w-full">
          {hero.map((p, i) => (
            <img
              key={p.id}
              src={p.src}
              alt={p.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === heroIndex ? "opacity-100" : "opacity-0"
              }`}
              fetchpriority={i === 0 ? "high" : "low"}
            />
          ))}
        </div>
      )}

      {/* Marker for nav behavior */}
      <div id="portfolio-grid-top" className="h-0 w-full" />

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-8 pt-12">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className="relative rounded-xl bg-white/5 p-3 transition-transform duration-200 will-change-transform contain-paint
                         cursor-pointer hover:scale-[1.03]"
              onClick={() => openFullscreen(i)}
            >
              <BlurImage
                src={p.src}
                alt={p.alt}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
      </main>

      {/* FULLSCREEN */}
      {selectedIndex != null && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFullscreen();
          }}
        >
          {/* Content wrapper:
              - uses var(--nav-pt) set by Navigation.jsx (0 when nav hidden, nav height when shown)
              - keeps chevrons perfectly centered within the visible area */}
          <div
            className="relative w-full flex items-center justify-center"
            style={{
              minHeight: "100vh",
              paddingTop: "var(--nav-pt, 0px)",
              paddingBottom: "32px",
            }}
          >
            {/* Close */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-6 text-white text-4xl font-light opacity-80 hover:opacity-100 transition-opacity z-[200]"
              aria-label="Close"
            >
              ×
            </button>

            {/* Prev (landscape-only rotation) */}
            {landscapeIndices.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = selectedIndex;
                  const pos = landscapeIndices.indexOf(cur);
                  const prev =
                    pos === -1
                      ? landscapeIndices.filter((i) => i < cur).pop() ??
                        landscapeIndices[landscapeIndices.length - 1]
                      : landscapeIndices[
                          (pos - 1 + landscapeIndices.length) %
                            landscapeIndices.length
                        ];
                  if (prev != null) {
                    setSelectedIndex(prev);
                    setFadeKey((k) => k + 1);
                  }
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[200]
                           w-12 h-12 rounded-full bg-white/10 hover:bg-white/20
                           flex items-center justify-center"
                aria-label="Previous image"
              >
                <svg width="28" height="28" stroke="white" fill="none" strokeWidth="2">
                  <path d="M18 6l-6 6 6 6" />
                </svg>
              </button>
            )}

            {/* Next (landscape-only rotation) */}
            {landscapeIndices.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = selectedIndex;
                  const pos = landscapeIndices.indexOf(cur);
                  const next =
                    pos === -1
                      ? landscapeIndices.find((i) => i > cur) ?? landscapeIndices[0]
                      : landscapeIndices[(pos + 1) % landscapeIndices.length];
                  if (next != null) {
                    setSelectedIndex(next);
                    setFadeKey((k) => k + 1);
                  }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[200]
                           w-12 h-12 rounded-full bg-white/10 hover:bg-white/20
                           flex items-center justify-center"
                aria-label="Next image"
              >
                <svg width="28" height="28" stroke="white" fill="none" strokeWidth="2">
                  <path d="M10 6l6 6-6 6" />
                </svg>
              </button>
            )}

            {/* Fullscreen image (shows any orientation) */}
            <img
              key={fadeKey}
              src={photos[selectedIndex].src}
              alt={photos[selectedIndex].alt}
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
              draggable="false"
            />
          </div>
        </div>
      )}
    </div>
  );
}
