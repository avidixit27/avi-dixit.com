export const ROUTES = Object.freeze({
  home: "/",
  shop: "/shop",
  contact: "/contact",
} as const);

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavigationItem {
  readonly path: RoutePath;
  readonly label: string;
  readonly feature?: keyof FeatureAvailability;
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = Object.freeze([
  Object.freeze({ path: ROUTES.home, label: "HOME" }),
  Object.freeze({ path: ROUTES.shop, label: "SHOP", feature: "shop" }),
  Object.freeze({ path: ROUTES.contact, label: "CONTACT", feature: "contact" }),
] as const satisfies readonly NavigationItem[]);
import type { FeatureAvailability } from "../app/featureAvailability";
