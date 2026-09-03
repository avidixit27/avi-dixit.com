import { useState } from "react";
import { PRODUCT_CATALOG } from "./resources/products";

export default function Shop() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
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
    <main className="min-h-screen bg-primary text-light">
      <div className="page-content active">
        <div className="max-w-7xl mx-auto px-8 pt-36 animate-fadeIn">
          <div className="flex flex-col lg:flex-row gap-8">
            <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCT_CATALOG.map((product) => (
                <article
                  key={product.id}
                  className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square bg-slate-700" />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {product.title}
                    </h3>
                    <p className="text-accentVivid text-lg mb-4">
                      ${product.price}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2 bg-accent hover:bg-accentWarm text-white font-bold transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="w-full lg:w-80 bg-slate-800 p-6 rounded-lg h-fit lg:sticky lg:top-36">
              <h2 className="text-2xl font-bold mb-6">
                Cart ({totalItems})
              </h2>

              <div className="space-y-4 mb-8">
                {cart.length === 0 && (
                  <p className="text-slate-400">Your cart is empty</p>
                )}
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <span>{item.title}</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between mb-4">
                  <span>Total:</span>
                  <span className="font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  className="w-full py-3 bg-accent hover:bg-accentWarm text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={cart.length === 0}
                >
                  Checkout
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
