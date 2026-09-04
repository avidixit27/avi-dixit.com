import { useEffect, useState } from "react";
import type { Photo } from "./photoCatalog";

const HERO_ROTATION_DELAY_MS = 5000;

interface HeroSlideshowProps {
  photos: readonly Photo[];
  onOpen: (index: number) => void;
}

export default function HeroSlideshow({ photos, onOpen }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (photos.length === 0) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((index) => (index + 1) % photos.length);
    }, HERO_ROTATION_DELAY_MS);
    return () => clearInterval(interval);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <button
      type="button"
      className="relative block h-[100svh] w-full cursor-pointer"
      onClick={() => onOpen(activeIndex)}
      aria-label="Open hero image gallery"
    >
      {photos.map((photo, index) => (
        <img
          key={photo.id}
          src={photo.src}
          alt={photo.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </button>
  );
}
