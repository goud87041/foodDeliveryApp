import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const KEY = "fd_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (food) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.foodId === food._id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          foodId: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          quantity: 1,
        },
      ];
    });
  };

  const setQty = (foodId, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((x) => x.foodId !== foodId));
      return;
    }
    setItems((prev) => prev.map((x) => (x.foodId === foodId ? { ...x, quantity } : x)));
  };

  const removeItem = (foodId) => setItems((prev) => prev.filter((x) => x.foodId !== foodId));

  const clear = () => setItems([]);

  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
