import type { Ref } from "react";

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
  readonly imageRef?: Ref<HTMLImageElement>;
  readonly onLoad?: () => void;
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
  imageRef,
  onLoad,
}: ResponsiveImageProps) {
  const priorityAttribute = { fetchpriority: fetchPriority };

  return (
    <picture className={pictureClassName}>
      {sources.map((source) => (
        <source
          key={source.type}
          type={source.type}
          srcSet={source.srcSet}
          sizes={sizes}
        />
      ))}
      <img
        {...priorityAttribute}
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
        onLoad={onLoad}
        draggable="false"
      />
    </picture>
  );
}
