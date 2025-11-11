export default function BlurImage({ src, alt, className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      draggable="false"
    />
  );
}
