import { useState, type CSSProperties, type Ref } from "react";

export interface ImageSource {
  readonly type: string;
  readonly srcSet: string;
}

interface ResponsiveImageProps {
  readonly src: string;
  readonly srcSet: string;
  readonly sources: readonly ImageSource[];
  readonly sizes: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly loading: "eager" | "lazy";
  readonly fetchPriority: "high" | "low" | "auto";
  readonly pictureClassName?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly imageRef?: Ref<HTMLImageElement>;
  readonly onLoad?: () => void;
  readonly onError?: () => void;
  readonly showSkeleton?: boolean;
}

export default function ResponsiveImage({
  src,
  srcSet,
  sources,
  sizes,
  width,
  height,
  alt,
  loading,
  fetchPriority,
  pictureClassName = "",
  className = "",
  style,
  imageRef,
  onLoad,
  onError,
  showSkeleton = false,
}: ResponsiveImageProps) {
  const [settledSrc, setSettledSrc] = useState<string>();
  return (
    <picture
      className={`${pictureClassName} ${showSkeleton && settledSrc !== src ? "image-skeleton" : ""}`}
    >
      {sources.map((source) => (
        <source
          key={source.type}
          type={source.type}
          srcSet={source.srcSet}
          sizes={sizes}
        />
      ))}
      <img
        {...{ fetchpriority: fetchPriority }}
        ref={imageRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        alt={alt}
        loading={loading}
        decoding="async"
        className={className}
        style={style}
        onLoad={() => {
          setSettledSrc(src);
          onLoad?.();
        }}
        onError={() => {
          setSettledSrc(src);
          onError?.();
        }}
        draggable="false"
      />
    </picture>
  );
}
