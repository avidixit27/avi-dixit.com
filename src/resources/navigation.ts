export const ROUTES = Object.freeze({
  home: "/",
  shop: "/shop",
  contact: "/contact",
} as const);

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavigationItem {
  readonly path: RoutePath;
  readonly label: string;
}

export const NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ path: ROUTES.home, label: "HOME" }),
  Object.freeze({ path: ROUTES.shop, label: "SHOP" }),
  Object.freeze({ path: ROUTES.contact, label: "CONTACT" }),
] as const satisfies readonly NavigationItem[]);
