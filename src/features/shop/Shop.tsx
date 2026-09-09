import { useState } from "react";
import { PRODUCT_CATALOG } from "./resources/products";
import type { Product } from "./resources/products";

interface CartItem extends Product {
  readonly quantity: number;
}

export default function Shop() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-canvas text-text">
      <div className="page-container pt-32 pb-20 sm:pt-36 sm:pb-24">
        <header className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-brand-vivid uppercase">
            Selected work
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Print shop
          </h1>
          <p className="mt-4 leading-7 text-text-muted">
            Explore the current print collections and prepare a selection.
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <section className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PRODUCT_CATALOG.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-panel border border-border bg-surface shadow-panel transition-colors hover:border-border-strong"
              >
                <div className="aspect-square bg-surface-muted" />
                <div className="p-5">
                  <h2 className="mb-2 text-xl font-semibold">
                    {product.title}
                  </h2>
                  <p className="mb-5 text-lg text-brand-vivid">
                    ${product.price}
                  </p>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full rounded-control bg-brand-warm py-2.5 font-semibold text-canvas transition-colors hover:bg-focus"
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit w-full rounded-panel border border-border bg-panel p-6 shadow-panel lg:sticky lg:top-24 lg:w-80">
            <h2 className="mb-6 text-2xl font-semibold">Cart ({totalItems})</h2>

            <div className="mb-8 space-y-4">
              {cart.length === 0 && (
                <p className="text-text-muted">Your cart is empty</p>
              )}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span>{item.title}</span>
                  <span className="text-text-muted">×{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-4 flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                type="button"
                className="w-full rounded-control bg-brand-warm py-3 font-semibold text-canvas transition-colors hover:bg-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
                disabled={cart.length === 0}
              >
                Checkout
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
