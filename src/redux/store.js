import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import productReducer from './productSlice';

export const CART_STORAGE_KEY = 'dz-tech-store:cart';

// The storefront used to persist mock ids such as "aurora-pro-headphones".
// Database products use MongoDB ObjectIds, so legacy cart entries are dropped
// instead of referencing products that no longer exist in the catalogue.
const DATABASE_ID_PATTERN = /^[a-f\d]{24}$/i;

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
        DATABASE_ID_PATTERN.test(item.id) &&
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
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
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
