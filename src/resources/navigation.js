export const ROUTES = Object.freeze({
  home: "/",
  shop: "/shop",
  contact: "/contact",
});

export const NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ path: ROUTES.home, label: "HOME" }),
  Object.freeze({ path: ROUTES.shop, label: "SHOP" }),
  Object.freeze({ path: ROUTES.contact, label: "CONTACT" }),
]);
