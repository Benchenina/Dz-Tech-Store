import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  clearCart,
  removeFromCart,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  updateQuantity,
} from '../redux/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import QuantityStepper from './QuantityStepper';

const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_FEE = 12;

export default function CartDrawer({ isOpen, onClose, onBrowse }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const [confirmation, setConfirmation] = useState(null);
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const amountForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  const handleClose = useCallback(() => {
    setConfirmation(null);
    onClose();
  }, [onClose]);

  const handleBrowse = useCallback(() => {
    setConfirmation(null);
    onBrowse();
  }, [onBrowse]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previouslyFocusedRef.current = document.activeElement;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 80);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusableElements = [
        ...panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ];

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.clearTimeout(focusTimer);

      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isOpen, handleClose]);

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }

    setConfirmation({
      orderId: `DZ-${Math.floor(100000 + Math.random() * 900000)}`,
      total,
      itemCount,
    });
    dispatch(clearCart());
  };

  return (
    <>
      <div
        className={`drawer-overlay${isOpen ? ' is-open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={`cart-drawer${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="drawer-header">
          <div>
            <p className="drawer-eyebrow">Your selection</p>
            <h2 id="cart-title" className="drawer-title">
              Shopping cart
              <span className="drawer-count">{itemCount}</span>
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="close-button"
            onClick={handleClose}
            aria-label="Close cart"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="drawer-body">
          {confirmation ? (
            <div className="checkout-success">
              <div className="success-icon" aria-hidden="true">
                <CheckCircle2 size={34} />
              </div>
              <h3>Order confirmed</h3>
              <span className="order-number">Order {confirmation.orderId}</span>
              <p>
                {confirmation.itemCount}{' '}
                {confirmation.itemCount === 1 ? 'item' : 'items'} ·{' '}
                <strong>{formatCurrency(confirmation.total)}</strong>
              </p>
              <p className="success-demo-note">
                This is a demo checkout, so no payment was processed.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleBrowse}>
                Continue shopping
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" aria-hidden="true">
                <ShoppingBag size={30} />
              </div>
              <h3>Your cart is empty</h3>
              <p>
                Good tech is waiting. Explore the collection and add something
                that earns its place on your desk.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleBrowse}>
                Browse products
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    width="76"
                    height="92"
                    loading="lazy"
                  />

                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <div>
                        <p className="cart-item-category">{item.category}</p>
                        <h3>{item.name}</h3>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(quantity) =>
                          dispatch(updateQuantity({ id: item.id, quantity }))
                        }
                        label={item.name}
                      />
                      <span className="cart-line-price">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!confirmation && items.length > 0 && (
          <div className="cart-footer">
            <div className="shipping-progress">
              <div className="shipping-progress-row">
                <Truck size={14} aria-hidden="true" />
                {amountForFreeShipping > 0 ? (
                  <p>
                    Add <strong>{formatCurrency(amountForFreeShipping)}</strong>{' '}
                    more for free shipping
                  </p>
                ) : (
                  <p>Free express shipping unlocked</p>
                )}
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progress toward free shipping"
                aria-valuemin={0}
                aria-valuemax={FREE_SHIPPING_THRESHOLD}
                aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
              >
                <span
                  className="progress-fill"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <dl className="summary-lines">
              <div>
                <dt>
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</dd>
              </div>
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="checkout-button"
              onClick={handleCheckout}
            >
              Checkout
              <ArrowRight size={16} aria-hidden="true" />
            </button>

            <p className="secure-note">
              <ShieldCheck size={13} aria-hidden="true" />
              Secure checkout · Taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
