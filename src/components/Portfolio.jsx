import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';

export default function Portfolio() {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const { navState } = useNavigation();

  useEffect(() => {
    const images = import.meta.glob('../imgs/portfolio/*.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}', { eager: true });
    const photoArray = Object.entries(images).map(([path, module], index) => ({
      id: index,
      src: module.default,
      alt: `Portfolio Photo ${index + 1}`
    }));
    setPhotos(photoArray);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        closeFullscreen();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  const handleImageClick = (photo) => {
    setSelectedImage(photo);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeFullscreen();
    }
  };

  const isActive = navState === 'portfolio-from-home' || navState === 'portfolio-from-shop';

  return (
    <div className={`page-content ${isActive ? 'active' : 'exit'}`}>
    <div className="min-h-screen bg-primary text-light">
      <main className={`max-w-7xl mx-auto px-8 pt-36 ${isActive ? 'animate-fadeIn' : ''}`}>
          <div id="portfolio-grid-top" className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {photos.map(photo => (
              <div key={photo.id} className="break-inside-avoid" onClick={() => handleImageClick(photo)}>
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
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={handleOverlayClick}
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
            className="absolute top-0 right-20 w-20 h-20 flex items-center justify-center text-white text-5xl font-black cursor-pointer select-none transition-opacity"
            style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}
            aria-label="Close fullscreen view"
          >×</button>
          <div 
            className="max-w-[95vw] max-h-[95vh] relative transform transition-all duration-300"
            style={{ animation: 'scaleIn 0.3s ease-out' }}
          >
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
