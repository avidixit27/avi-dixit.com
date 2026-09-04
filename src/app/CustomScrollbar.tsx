import { useEffect, useRef } from "react";

const FALLBACK_THUMB_HEIGHT_PX = 80;
const SCROLL_HIDE_DELAY_MS = 1200;
const DRAG_HIDE_DELAY_MS = 700;

export default function CustomScrollbar() {
  const scrollbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollbar = scrollbarRef.current;
    if (!scrollbar) return undefined;

    const documentElement = document.documentElement;
    let hideTimer: number | undefined;
    let isDragging = false;
    let dragOffsetY = 0;

    const hideAfter = (delay: number) => {
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        scrollbar.style.opacity = "0";
      }, delay);
    };

    const getMeasurements = () => {
      const thumbHeight = scrollbar.offsetHeight || FALLBACK_THUMB_HEIGHT_PX;
      return {
        scrollHeight: documentElement.scrollHeight - window.innerHeight,
        trackHeight: Math.max(window.innerHeight - thumbHeight, 0),
      };
    };

    const positionFromScroll = (reveal: boolean) => {
      const { scrollHeight, trackHeight } = getMeasurements();
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      scrollbar.style.top = `${progress * trackHeight}px`;

      if (reveal && !isDragging) {
        scrollbar.style.opacity = "1";
        hideAfter(SCROLL_HIDE_DELAY_MS);
      }
    };

    const onScroll = () => positionFromScroll(true);
    const onResize = () => positionFromScroll(false);

    const onMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      isDragging = true;
      scrollbar.dataset.dragging = "true";
      scrollbar.classList.add("dragging");
      scrollbar.style.opacity = "1";
      dragOffsetY = event.clientY - scrollbar.getBoundingClientRect().top;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const { scrollHeight, trackHeight } = getMeasurements();
      const nextTop = Math.min(
        Math.max(event.clientY - dragOffsetY, 0),
        trackHeight,
      );
      scrollbar.style.top = `${nextTop}px`;

      const progress = trackHeight > 0 ? nextTop / trackHeight : 0;
      window.scrollTo({ top: progress * scrollHeight, behavior: "auto" });
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      scrollbar.dataset.dragging = "false";
      scrollbar.classList.remove("dragging");
      hideAfter(DRAG_HIDE_DELAY_MS);
    };

    positionFromScroll(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    scrollbar.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);

    return () => {
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      scrollbar.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      scrollbar.dataset.dragging = "false";
      scrollbar.classList.remove("dragging");
      scrollbar.style.opacity = "0";
    };
  }, []);

  return <div ref={scrollbarRef} className="custom-scrollbar" />;
}
