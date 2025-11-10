import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import BlurImage from './BlurImage'; 

export default function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const { navState } = useNavigation();

  const OVERLAY_MS = 300;

  useEffect(() => {
    const images = import.meta.glob('../imgs/portfolio/*.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}', { eager: true });
    const photoArray = Object.entries(images).map(([path, mod], index) => ({
      id: index,
      src: mod.default,
      alt: `Portfolio Photo ${index + 1}`,
    }));
    setPhotos(photoArray);
  }, []);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape' && selectedImage) closeFullscreen(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [selectedImage]);

  const handleImageClick = (photo) => setSelectedImage(photo);

  const closeFullscreen = () => {
    setIsClosing(true);
    // we’re not locking/unlocking scroll here—keeping your current working behavior
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
                  {/* Use BlurImage if you created it; otherwise swap back to <img /> */}
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
