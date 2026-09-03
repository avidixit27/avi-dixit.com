const photoModules = import.meta.glob("../../imgs/portfolio/*.JPG", {
  eager: true,
});

export const PHOTO_CATALOG = Object.freeze(
  Object.entries(photoModules).map(([path, module], index) =>
    Object.freeze({
      id: path,
      src: module.default,
      alt: `Photo ${index + 1}`,
    }),
  ),
);
