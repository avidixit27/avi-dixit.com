import { useCallback, useEffect, useRef, useState } from "react";
import { getAdjacentPhotoIndex } from "./photoNavigation";

const CLOSE_DURATION_MS = 150;
const CLOSE_BUTTON_TOP_OFFSET_PX = 12;
const DEFAULT_CLOSE_BUTTON_TOP_PX = 24;

export default function Lightbox({
  photos,
  selectedIndex,
  landscapeIndices,
  onSelect,
  onClosed,
}) {
  const imageRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [closeButtonTop, setCloseButtonTop] = useState(
    DEFAULT_CLOSE_BUTTON_TOP_PX,
  );

  const updateCloseButton = useCallback(() => {
    if (!imageRef.current) return;
    const imageRect = imageRef.current.getBoundingClientRect();
    setCloseButtonTop(imageRect.top - CLOSE_BUTTON_TOP_OFFSET_PX);
  }, []);

  const requestClose = useCallback(() => {
    if (closeTimerRef.current) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClosed();
    }, CLOSE_DURATION_MS);
  }, [onClosed]);

  const selectAdjacent = useCallback(
    (direction) => {
      const nextIndex = getAdjacentPhotoIndex(
        selectedIndex,
        landscapeIndices,
        direction,
      );
      if (nextIndex != null) onSelect(nextIndex);
    },
    [landscapeIndices, onSelect, selectedIndex],
  );

  useEffect(() => {
    setIsClosing(false);
    updateCloseButton();
  }, [selectedIndex, updateCloseButton]);

  useEffect(() => {
    window.addEventListener("resize", updateCloseButton);
    return () => window.removeEventListener("resize", updateCloseButton);
  }, [updateCloseButton]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        selectAdjacent(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        selectAdjacent(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose, selectAdjacent]);

  useEffect(
    () => () => {
      clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const photo = photos[selectedIndex];

  return (
    <div
      className={`fixed inset-0 bg-black/95 z-[100] overflow-hidden flex items-center justify-center
                  transition-opacity ${isClosing ? "opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: `${CLOSE_DURATION_MS}ms` }}
      onMouseDown={requestClose}
      onClick={requestClose}
    >
      <button
        onMouseDown={(event) => {
          event.stopPropagation();
          requestClose();
        }}
        onClick={(event) => {
          event.stopPropagation();
          requestClose();
        }}
        className="fixed right-8 z-[200] text-white text-4xl font-light
                   drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]
                   opacity-90 hover:opacity-100 hover:text-accentWarm
                   transition-colors transition-opacity"
        style={{ top: `${closeButtonTop}px` }}
        aria-label="Close"
      >
        ×
      </button>

      {landscapeIndices.length > 0 && (
        <>
          <button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              selectAdjacent(-1);
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

          <button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              selectAdjacent(1);
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

      <img
        key={selectedIndex}
        ref={imageRef}
        src={photo.src}
        alt={photo.alt}
        className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
        onLoad={updateCloseButton}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        draggable="false"
      />
    </div>
  );
}
