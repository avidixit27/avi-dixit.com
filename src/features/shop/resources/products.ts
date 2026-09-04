export interface Product {
  readonly id: number;
  readonly title: string;
  readonly price: number;
}

export const PRODUCT_CATALOG = Object.freeze([
  Object.freeze({ id: 1, title: "Nature Series", price: 149 }),
  Object.freeze({ id: 2, title: "Urban Collection", price: 199 }),
  Object.freeze({ id: 3, title: "Portrait Pack", price: 299 }),
] as const satisfies readonly Product[]);
