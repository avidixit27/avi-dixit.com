import { describe, expect, it } from "vitest";
import { PRODUCT_CATALOG } from "./products";

describe("product catalog", () => {
  it("provides unique purchasable products with stable identities", () => {
    const ids = PRODUCT_CATALOG.map((product) => product.id);

    expect(PRODUCT_CATALOG).not.toHaveLength(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      PRODUCT_CATALOG.every(
        (product) =>
          Number.isInteger(product.id) &&
          product.id > 0 &&
          product.title.trim().length > 0 &&
          Number.isFinite(product.price) &&
          product.price > 0,
      ),
    ).toBe(true);
  });
});
