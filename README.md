# DZ Tech Store

A production-ready e-commerce storefront built with **React 19**, **Vite**, **Redux Toolkit**, and **React-Redux**.

## Features

- Dark, responsive storefront with a hero, product grid, search, category filters, and sorting
- Cart state managed globally with Redux Toolkit
- Add to cart, remove from cart, and direct quantity updates (buttons or number input)
- Slide-out cart drawer with subtotal, shipping, free-shipping progress, and total
- Cart persisted to `localStorage` so it survives refreshes
- Accessible interactions: focus trap, Escape-to-close, focus restoration, scroll lock, ARIA labels, and live regions
- Demo checkout confirmation flow (no payment is processed)
- Clean SVG icons via `lucide-react`
- Responsive layout from mobile to wide desktop

## Getting started

```bash
npm install
npm run dev
```

Vite prints the local development URL (typically `http://localhost:5173`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |

## Project structure

```
src/
├── App.jsx                  # Page composition + local UI state (search, category, sort, drawer)
├── App.css                  # Layout and component styling
├── index.css                # Design tokens, reset, global styles
├── main.jsx                 # React root + Redux Provider
├── components/
│   ├── Header.jsx           # Sticky nav + live cart count
│   ├── Hero.jsx             # Landing hero + featured product spotlight
│   ├── ProductList.jsx      # Product grid and empty state
│   ├── ProductCard.jsx      # Reusable product card with add-to-cart
│   ├── QuantityStepper.jsx  # Reusable quantity control
│   ├── CartDrawer.jsx       # Sliding cart, totals, demo checkout
│   └── Footer.jsx
├── data/
│   └── products.js          # Mock product catalog
├── redux/
│   ├── store.js             # Store configuration + localStorage persistence
│   └── cartSlice.js         # Cart slice, actions, and selectors
└── utils/
    └── formatCurrency.js    # Shared Intl currency formatter
```

## Redux API

```js
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from './redux/cartSlice';

dispatch(addToCart(product));
dispatch(addToCart(product, 2)); // optional starting quantity
dispatch(removeFromCart(productId));
dispatch(updateQuantity({ id: productId, quantity: 3 }));
dispatch(clearCart());
```

Selectors:

```js
selectCartItems; // [{ id, name, price, image, category, quantity }]
selectCartCount; // total quantity across all items
selectCartSubtotal; // total price before shipping
```

Quantities are clamped between `1` and `99`, and adding an item that already exists increments its quantity.

## Notes

- Product photography is loaded from Unsplash; cards fall back to a styled placeholder if an image fails.
- The checkout is intentionally a demo: it creates a local order confirmation, clears the cart, and does not contact a payment provider.
- Cart persistence uses `localStorage` under the key `dz-tech-store:cart`.
