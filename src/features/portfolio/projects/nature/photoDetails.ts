import type { PhotoDetails } from "../../photoTypes";

export const NATURE_PHOTO_DETAILS = {
  "leaves-and-clouds-1.jpg": {
    id: "leaves-and-clouds-1",
    sequence: 1,
    alt: "Red autumn leaves framing wispy clouds in a blue sky",
    width: 6000,
    height: 4000,
  },
  "leaves-and-clouds-2.jpg": {
    id: "leaves-and-clouds-2",
    sequence: 2,
    alt: "Wispy clouds above autumn trees",
    width: 6000,
    height: 4000,
  },
  "crystal-towers-sky.jpg": {
    id: "crystal-towers-sky",
    sequence: 3,
    alt: "Dramatic clouds above Crystal Towers",
    width: 5986,
    height: 3991,
  },
  "bridge-reflection.jpg": {
    id: "bridge-reflection",
    sequence: 4,
    alt: "A footbridge reflected beneath autumn trees",
    width: 5644,
    height: 3763,
  },
  "ducks-1.jpg": {
    id: "ducks-1",
    sequence: 5,
    alt: "Ducks swimming through a green pond behind tall grasses",
    width: 5694,
    height: 3993,
  },
  "quarry-tree-reflection.jpg": {
    id: "quarry-tree-reflection",
    sequence: 6,
    alt: "Trees and clouds reflected in a quiet quarry pond",
    width: 6000,
    height: 4000,
  },
} as const satisfies Record<string, PhotoDetails>;
