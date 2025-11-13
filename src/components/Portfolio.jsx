import { useEffect, useMemo, useRef, useState } from "react";
import BlurImage from "./BlurImage";

export default function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [fadeKey, setFadeKey] = useState(0);
  const [closing, setClosing] = useState(false);

  const imgRef = useRef(null);
  const [closePos, setClosePos] = useState({ top: 24, right: 24 });

  // Load images (.JPG)
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

  // Hero slideshow
  const hero = useMemo(() => photos.slice(0, 8), [photos]);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (!hero.length) return;
    const id = setInterval(
      () => setHeroIndex((i) => (i + 1) % hero.length),
      5000
    );
    return () => clearInterval(id);
  }, [hero.length]);

  // Landscape-only for arrow rotation
  const [landscapeIndices, setLandscapeIndices] = useState([]);
  useEffect(() => {
    const compute = async () => {
      const idxs = [];
      for (let i = 0; i < photos.length; i++) {
        const img = new Image();
        img.src = photos[i].src;
        await img.decode().catch(() => {});
        if (img.width > img.height * 1.2) idxs.push(i);
      }
      setLandscapeIndices(idxs);
    };
    if (photos.length) compute();
  }, [photos]);

  const openFullscreen = (i) => {
    document.documentElement.classList.add("modal-open");
    setSelectedIndex(i);
    setFadeKey((k) => k + 1);
    setClosing(false);
  };

  const closeFullscreen = () => {
    setClosing(true);
    setTimeout(() => {
      setSelectedIndex(null);
      setClosing(false);
      document.documentElement.classList.remove("modal-open");
    }, 150); // keep this in sync with duration-150 below
  };

  // Align × to image top (x is fixed all the way right)
  const updateClose = () => {
    const el = imgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setClosePos({
      top: r.top - 12,
    });
  };

  useEffect(() => {
    updateClose();
    window.addEventListener("resize", updateClose);
    return () => window.removeEventListener("resize", updateClose);
  }, [selectedIndex, fadeKey]);

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
              className="relative rounded-xl bg-white/5 p-3 transform-gpu transition-transform duration-200 will-change-transform contain-paint
                         cursor-pointer hover:scale-[1.015] shadow-md hover:shadow-lg"
              onClick={() => openFullscreen(i)}
            >
              <BlurImage
                src={p.src}
                alt={p.alt}
                className="w-full h-auto rounded-lg"
              />
            </div>
          ))}
        </div>
      </main>

      {/* FULLSCREEN (click anywhere outside to close) */}
      {selectedIndex != null && (
        <div
          className={`fixed inset-0 bg-black/95 z-[100] overflow-hidden flex items-center justify-center
                      transition-opacity duration-150 ${
                        closing ? "opacity-0" : "opacity-100"
                      }`}
          onMouseDown={closeFullscreen}
          onClick={closeFullscreen}
        >
          {/* Close button – x fixed to right edge, y aligned with image top */}
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
            className="fixed right-8 z-[200] text-white text-4xl font-light
                       drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]
                       opacity-90 hover:opacity-100 hover:text-accentWarm
                       transition-colors transition-opacity"
            style={{ top: `${closePos.top}px` }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Arrows (landscape sequence) */}
          {landscapeIndices.length > 0 && (
            <>
              {/* LEFT ARROW – stays as before */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = selectedIndex;
                  const pos = landscapeIndices.indexOf(cur);
                  const prev =
                    pos === -1
                      ? landscapeIndices.filter((i) => i < cur).pop() ??
                        landscapeIndices.at(-1)
                      : landscapeIndices[
                          (pos - 1 + landscapeIndices.length) %
                            landscapeIndices.length
                        ];
                  setSelectedIndex(prev);
                  setFadeKey((k) => k + 1);
                }}
                className="fixed left-4 top-1/2 -translate-y-1/2 z-[200]
                           grid place-items-center w-12 h-12 md:w-14 md:h-14
                           rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Previous image"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="white"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* RIGHT ARROW – keeps original all-the-way-right centering */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = selectedIndex;
                  const pos = landscapeIndices.indexOf(cur);
                  const next =
                    pos === -1
                      ? landscapeIndices.find((i) => i > cur) ??
                        landscapeIndices[0]
                      : landscapeIndices[
                          (pos + 1) % landscapeIndices.length
                        ];
                  setSelectedIndex(next);
                  setFadeKey((k) => k + 1);
                }}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-[200]
                           grid place-items-center w-12 h-12 md:w-14 md:h-14
                           rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Next image"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="white"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            </>
          )}

          {/* Center image */}
          <img
            key={fadeKey}
            ref={imgRef}
            src={photos[selectedIndex].src}
            alt={photos[selectedIndex].alt}
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
            onLoad={updateClose}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            draggable="false"
          />
        </div>
      )}
    </div>
  );
}
