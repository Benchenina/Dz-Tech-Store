# DZ Tech Store

A dark, responsive e-commerce storefront built with **React 19**, **Vite**, **Redux Toolkit**, **React-Redux**, and **Lucide React**. It is integrated with the ENSTA WAMD TD-TP 3 Node.js/Express/MongoDB API.

## Features

- Product catalogue loaded from `GET /api/products`
- Email/password registration and login through the backend API
- JWT persisted in `localStorage` and sent as `Authorization: Bearer <token>`
- Signed-in user name, logout action, and admin-only product creation
- Protected product creation through `POST /api/products`
- Cart state managed with Redux Toolkit and persisted to `localStorage`
- Add to cart, remove from cart, and quantity updates
- Slide-out cart drawer with subtotal, shipping, free-shipping progress, and total
- Accessible interactions: focus management, Escape-to-close, scroll lock, ARIA labels, and live regions
- Loading, error, and notification states with Lucide icons
- Dark theme with rounded 12px and larger surfaces
- Demo checkout confirmation flow (no payment is processed)

## Requirements

- Node.js 18 or newer
- MongoDB running locally on `mongodb://127.0.0.1:27017`
- The backend API running at `http://localhost:5000`

## Getting started

Start MongoDB first, then run the backend:

```bash
cd "/home/meheni/Music/TP web dev"
npm install
npm run seed:fresh
npm run dev
```

In another terminal, start the storefront:

```bash
cd "/home/meheni/Music/dz-tech-store"
npm install
npm run dev
```

Open `http://localhost:5173`.

The storefront reads its API URL from `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:5000/api
```

If the variable is missing, `src/services/api.js` falls back to the same URL. The Vite server uses port `5173` with `strictPort: true` so it matches the backend CORS configuration.

## Authentication flow

1. Select **Sign in** in the header.
2. Switch to **Register** to create an account.
3. Registration creates the user and signs in automatically.
4. The JWT is stored under `dz-tech-store:token`.
5. Once signed in, **Add product** appears in the header.
6. The product form sends the JWT to the protected `POST /api/products` endpoint.
7. Use the logout icon to clear the stored token and user.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |

## Project structure

```text
src/
├── App.jsx                    # Catalogue, filters, dialogs and page composition
├── App.css                    # Layout, components, modals and responsive styles
├── index.css                  # Design tokens, reset and global styles
├── main.jsx                   # React root and Redux Provider
├── components/
│   ├── Header.jsx             # Navigation, account state, admin trigger and cart count
│   ├── Hero.jsx               # Landing hero and featured product spotlight
│   ├── ProductList.jsx        # Product grid and empty state
│   ├── ProductCard.jsx        # Product card with add-to-cart
│   ├── QuantityStepper.jsx    # Reusable quantity control
│   ├── CartDrawer.jsx         # Sliding cart, totals and demo checkout
│   ├── AuthModal.jsx          # Login and registration dialog
│   ├── AddProductModal.jsx    # Protected product creation form
│   ├── StatusToast.jsx        # Lucide-based notifications
│   └── Footer.jsx
├── redux/
│   ├── store.js               # Store configuration and cart persistence
│   ├── authSlice.js           # JWT, user, loading and error state
│   ├── productSlice.js        # API catalogue and product mutations
│   └── cartSlice.js           # Cart actions and selectors
├── services/
│   └── api.js                 # Fetch client, token storage and product normalisation
├── data/
│   └── products.js            # Original mock catalogue kept as design reference
└── utils/
    └── formatCurrency.js      # Shared Intl currency formatter
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

- The API returns both `id` and `_id`; the frontend normalises them so cart references and React keys stay stable.
- Products support both `image` and `imageUrl` for compatibility with the storefront and the legacy testing dashboard.
- Product photography is loaded from Unsplash; missing or failed images fall back to a styled Lucide placeholder.
- The checkout is intentionally a demo: it creates a local order confirmation, clears the cart, and does not contact a payment provider.
- Cart persistence uses `localStorage` under the key `dz-tech-store:cart`. Legacy carts
  containing the old mock slugs are discarded because database products use MongoDB ids.
