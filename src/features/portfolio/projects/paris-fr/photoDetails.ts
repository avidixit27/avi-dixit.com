import type { PhotoDetails } from "../../photoTypes";

export const PARIS_FR_PHOTO_DETAILS = {
  "hand-holding-flowers.jpg": {
    id: "hand-holding-flowers",
    sequence: 1,
    alt: "A hand holding flowers in Paris",
    width: 5626,
    height: 4000,
  },
  "hanging-shoes.jpg": {
    id: "hanging-shoes",
    sequence: 2,
    alt: "Shoes hanging overhead in Paris",
    width: 3915,
    height: 5872,
  },
  "merry-go-round-horse.jpg": {
    id: "merry-go-round-horse",
    sequence: 3,
    alt: "A merry-go-round horse in Paris",
    width: 5910,
    height: 3281,
  },
  "sacre-coeur-basilica.jpg": {
    id: "sacre-coeur-basilica",
    sequence: 4,
    alt: "Sacré-Cœur Basilica framed by trees in Paris",
    width: 6000,
    height: 4000,
  },
} as const satisfies Record<string, PhotoDetails>;
