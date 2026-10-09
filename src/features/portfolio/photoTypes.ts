import type { ImageSource } from "../../components/ResponsiveImage";

export interface Photo {
  readonly id: string;
  readonly sequence: number;
  readonly src: string;
  readonly srcSet: string;
  readonly sources: readonly ImageSource[];
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly alt: string;
}

export interface PhotoDetails {
  readonly id: string;
  readonly sequence: number;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}
