import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';

export default function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isClosing, setIsClosing] = useState(false); // NEW: lets us fade out smoothly
  const { navState } = useNavigation();

  const OVERLAY_MS = 300; // match your CSS fade timing

  useEffect(() => {
    const images = import.meta.glob('../imgs/portfolio/*.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}', { eager: true });
    const photoArray = Object.entries(images).map(([path, module], index) => ({
      id: index,
      src: module.default,
      alt: `Portfolio Photo ${index + 1}`,
    }));
    setPhotos(photoArray);
  }, []);

  // ESC to close
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape' && selectedImage) closeFullscreen(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [selectedImage]);

  /* --------- Scroll lock coordinated with fade ---------- */

  const lockScroll = () => {
    // measure scrollbar width for compensation
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    const root = document.documentElement;
    root.style.setProperty('--sbw', `${sbw}px`);

    // 1) tint gutter immediately so the background darkens with the overlay
    root.classList.add('modal-open');

    // 2) only after the overlay fade is underway, hide overflow/apply padding
    //    (prevents the scrollbar from vanishing too early = no jiggle)
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        root.classList.add('lock-scroll');
      }, OVERLAY_MS);
    });
  };

  const unlockScroll = () => {
    const root = document.documentElement;
    // wait for the overlay to fade out before showing the scrollbar again
    root.classList.remove('lock-scroll');
    root.classList.remove('modal-open');
    root.style.removeProperty('--sbw');
  };

  const handleImageClick = (photo) => {
    setSelectedImage(photo);
    lockScroll();
  };

  const closeFullscreen = () => {
    // fade the overlay out, then unmount + unlock
    setIsClosing(true);
    unlockScroll();
    setTimeout(() => {
      setSelectedImage(null);
      setIsClosing(false);
    }, OVERLAY_MS);
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) closeFullscreen(); };

  const isActive = navState === 'portfolio-from-home' || navState === 'portfolio-from-shop';

  return (
    <div className={`page-content ${isActive ? 'active' : 'exit'}`}>
      <div className="min-h-screen bg-primary text-light">
        <main className={`max-w-7xl mx-auto px-8 pt-20 ${isActive ? 'animate-fadeIn' : ''}`}>
          <div id="portfolio-grid-top" />

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid"
                onClick={() => handleImageClick(photo)}
              >
                <div className="relative overflow-hidden rounded-xl bg-white/5 p-3 transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-2xl cursor-pointer">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-auto rounded-lg shadow-lg transition-all duration-300"
                    loading="lazy"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {selectedImage && (
        <div
          className={`fixed inset-0 bg-black/95 z-[80] flex items-center justify-center ${
            isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={handleOverlayClick}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeFullscreen(); }}
            className="absolute top-0 right-20 w-20 h-20 flex items-center justify-center text-white text-5xl font-black cursor-pointer select-none transition-opacity"
            style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}
            aria-label="Close fullscreen view"
          >
            ×
          </button>

          <div className="max-w-[95vw] max-h-[95vh] relative">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
