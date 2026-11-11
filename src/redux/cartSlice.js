import { createSelector, createSlice } from '@reduxjs/toolkit';

export const MAX_QUANTITY = 99;

const clampQuantity = (quantity) => {
  const parsed = Number(quantity);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(parsed)));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: {
      reducer(state, action) {
        const product = action.payload;
        const id = String(product?.id || product?._id || '');

        if (!id) {
          return;
        }

        const existingItem = state.items.find((item) => item.id === id);

        if (existingItem) {
          existingItem.quantity = clampQuantity(
            existingItem.quantity + (product.quantity ?? 1),
          );
          return;
        }

        state.items.push({
          id,
          name: product.name,
          price: product.price,
          image: product.image || product.imageUrl || '',
          category: product.category,
          quantity: clampQuantity(product.quantity ?? 1),
        });
      },
      prepare(product, quantity = 1) {
        return { payload: { ...product, quantity } };
      },
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((cartItem) => cartItem.id === id);

      if (!item) {
        return;
      }

      item.quantity = clampQuantity(quantity);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, clearCart, removeFromCart, updateQuantity } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
);

export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0),
);

export default cartSlice.reducer;
