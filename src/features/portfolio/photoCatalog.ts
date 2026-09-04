export interface Photo {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
}

const photoModules = import.meta.glob<{ default: string }>(
  "../../imgs/portfolio/*.JPG",
  { eager: true },
);

export const PHOTO_CATALOG = Object.freeze(
  Object.entries(photoModules).map(([path, module], index) =>
    Object.freeze({
      id: path,
      src: module.default,
      alt: `Photo ${index + 1}`,
    }),
  ),
) satisfies readonly Photo[];
