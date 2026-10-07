import type { PhotoDetails } from "../../photoTypes";

export const KERALA_PHOTO_DETAILS = {
  "person-before-field.jpg": {
    id: "person-before-field",
    sequence: 2,
    alt: "A person standing before a field in Alleppey",
    width: 6000,
    height: 4000,
  },
  "palm-tree-sunset.jpg": {
    id: "palm-tree-sunset",
    sequence: 3,
    alt: "A palm tree at sunset in Alleppey",
    width: 6000,
    height: 4000,
  },
  "kochi-port-ocean-sky.jpg": {
    id: "kochi-port-ocean-sky",
    sequence: 1,
    alt: "Kochi port beneath an ocean sky",
    width: 6000,
    height: 4000,
  },
  "plane-center.jpg": {
    id: "plane-center",
    sequence: 4,
    alt: "An airplane centered in a blue sky",
    width: 5619,
    height: 3326,
  },
} as const satisfies Record<string, PhotoDetails>;
