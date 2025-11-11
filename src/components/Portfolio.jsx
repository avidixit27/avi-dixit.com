import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import BlurImage from './BlurImage';

export default function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null); // index instead of object
  const [isClosing, setIsClosing] = useState(false);
  const { navState } = useNavigation();

  const OVERLAY_MS = 300;
  const selectedImage = (selectedIndex !== null && photos[selectedIndex]) ? photos[selectedIndex] : null;

  useEffect(() => {
    const images = import.meta.glob('../imgs/portfolio/*.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}', { eager: true });
    const photoArray = Object.entries(images).map(([path, mod], index) => ({
      id: index,
      src: mod.default,
      alt: `Portfolio Photo ${index + 1}`,
    }));
    // sort stable for consistent order
    photoArray.sort((a, b) => a.id - b.id);
    setPhotos(photoArray);
  }, []);

  // Keyboard: ESC to close, ← / → to navigate when modal open
  useEffect(() => {
    const onKey = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeFullscreen();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex, photos.length]);

  const handleImageClick = (photo) => setSelectedIndex(photo.id);

  const closeFullscreen = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedIndex(null);
      setIsClosing(false);
    }, OVERLAY_MS);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeFullscreen();
  };

  const goNext = () => {
    if (!photos.length) return;
    setSelectedIndex((idx) => (idx + 1) % photos.length);
  };

  const goPrev = () => {
    if (!photos.length) return;
    setSelectedIndex((idx) => (idx - 1 + photos.length) % photos.length);
  };

  const isActive = navState === 'portfolio-from-home' || navState === 'portfolio-from-shop';

  return (
    <div className={`page-content ${isActive ? 'active' : 'exit'}`}>
      <div className="min-h-screen bg-primary text-light">
        <main className={`max-w-7xl mx-auto px-8 pt-20 ${isActive ? 'animate-fadeIn' : ''}`}>
          {/* Smart-header trigger */}
          <div id="portfolio-grid-top" />

          {/* Masonry grid: native aspect images, hover grow, click to enlarge */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid"
                onClick={() => handleImageClick(photo)}
              >
                <div className="relative overflow-hidden rounded-xl bg-white/5 p-3 transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-2xl cursor-pointer">
                  {BlurImage ? (
                    <BlurImage
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-auto rounded-lg shadow-lg"
                      priority={photo.id < 3}
                    />
                  ) : (
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-auto rounded-lg shadow-lg transition-all duration-300"
                      loading={photo.id < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      style={{ width: '100%', display: 'block' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Fullscreen modal */}
      {selectedImage && (
        <div
          className={`fixed inset-0 bg-black/95 z-[80] flex items-center justify-center ${
            isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
        >
          {/* Close (X) */}
          <button
            onClick={(e) => { e.stopPropagation(); closeFullscreen(); }}
            className="absolute top-4 right-6 text-white text-4xl font-light opacity-70 hover:opacity-100 transition-opacity duration-200 select-none z-[100]"
            style={{ fontFamily: `'SF Pro Display','Helvetica Neue',Arial,sans-serif`, lineHeight: '1' }}
            aria-label="Close fullscreen view"
          >
            ×
          </button>

          {/* Prev / Next chevrons (large, soft hit areas) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
                className="
                  absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-[100]
                  flex items-center justify-center
                  w-12 h-12 md:w-14 md:h-14
                  rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm
                  text-white/90 hover:text-white
                  transition-all duration-200
                "
              >
                {/* Left chevron (SVG) */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
                className="
                  absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-[100]
                  flex items-center justify-center
                  w-12 h-12 md:w-14 md:h-14
                  rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm
                  text-white/90 hover:text-white
                  transition-all duration-200
                "
              >
                {/* Right chevron (SVG) */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-[95vw] max-h-[95vh] relative">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl select-none"
              draggable="false"
            />
          </div>
        </div>
      )}
    </div>
  );
}
