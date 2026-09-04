interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function BlurImage({
  src,
  alt,
  className = "",
}: BlurImageProps) {
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
