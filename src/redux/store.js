import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const CART_STORAGE_KEY = 'dz-tech-store:cart';

const loadCart = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return undefined;
    }

    const parsedCart = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      return undefined;
    }

    const items = parsedCart.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.image === 'string' &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0,
    );

    return items.length > 0 ? items : undefined;
  } catch {
    return undefined;
  }
};

const persistedItems = loadCart();

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: persistedItems ? { cart: { items: persistedItems } } : undefined,
});

store.subscribe(() => {
  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(store.getState().cart.items),
    );
  } catch {
    // Storage can be unavailable in private browsing or when the quota is full.
  }
});
