import { useSelector } from 'react-redux';
import { ShoppingBag, Truck, Zap } from 'lucide-react';
import { selectCartCount } from '../redux/cartSlice';

export default function Header({ onOpenCart, onBrowseCategory }) {
  const cartCount = useSelector(selectCartCount);

  return (
    <header className="site-header" id="top">
      <div className="header-inner container">
        <a className="brand" href="#top" aria-label="DZ Tech Store home">
          <span className="brand-mark" aria-hidden="true">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="brand-text">
            DZ<span>Tech</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Primary">
          <button
            type="button"
            className="nav-link"
            onClick={() => onBrowseCategory('All')}
          >
            All gear
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => onBrowseCategory('Audio')}
          >
            Audio
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => onBrowseCategory('Accessories')}
          >
            Accessories
          </button>
        </nav>

        <div className="header-actions">
          <span className="shipping-note">
            <Truck size={14} aria-hidden="true" />
            Free shipping over $150
          </span>

          <button
            type="button"
            className="cart-button"
            onClick={onOpenCart}
            aria-label={`Open cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag size={17} aria-hidden="true" />
            <span className="cart-button-label">Cart</span>
            <span className="cart-count" key={cartCount} aria-hidden="true">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          </button>
          <span className="sr-only" aria-live="polite">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
          </span>
        </div>
      </div>
    </header>
  );
}
