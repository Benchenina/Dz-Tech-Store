import {
  ArrowDown,
  LoaderCircle,
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function Hero({
  featuredProduct,
  productCount,
  onShop,
  isLoading = false,
}) {
  const product = featuredProduct;
  const image = product?.image || product?.imageUrl || '';
  const rating = Number(product?.rating) || 0;
  const reviews = Number(product?.reviews) || 0;

  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          New season drop · 2026
        </p>

        <h1 id="hero-title">
          Tech that keeps you <span className="gradient-text">in flow.</span>
        </h1>

        <p className="hero-description">
          Thoughtfully curated audio, displays, and desk gear for people who
          care how their setup feels — not just how it looks.
        </p>

        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onShop}>
            Shop the collection
            <ArrowDown size={16} aria-hidden="true" />
          </button>
          <span className="hero-shipping-note">
            <Truck size={15} aria-hidden="true" />
            Free express shipping over $150
          </span>
        </div>

        <ul className="hero-stats">
          <li>
            <strong>4.9/5</strong>
            <span>from 2,400+ reviews</span>
          </li>
          <li>
            <strong>{isLoading && productCount === 0 ? '...' : productCount}</strong>
            <span>curated products</span>
          </li>
          <li>
            <strong>2-year</strong>
            <span>warranty included</span>
          </li>
        </ul>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="spotlight-card">
          <span className="spotlight-tag">
            <Sparkles size={12} />
            Editor's pick
          </span>

          {image ? (
            <img
              className="spotlight-image"
              src={image}
              alt=""
              width="900"
              height="675"
            />
          ) : (
            <div className="spotlight-placeholder">
              <LoaderCircle
                size={30}
                className={isLoading ? 'spinner' : undefined}
              />
              <span>{isLoading ? 'Loading catalogue' : 'Catalogue unavailable'}</span>
            </div>
          )}

          <div className="spotlight-info">
            <div>
              <h3>{product?.name || 'DZ Tech collection'}</h3>
              <p>
                {product
                  ? `${product.category || 'Gear'} · Curated by DZ Tech`
                  : 'Connecting to the storefront API'}
              </p>
            </div>
            <span className="spotlight-price">
              {product ? formatCurrency(product.price) : '-'}
            </span>
          </div>
        </div>

        {product && rating > 0 && (
          <div className="floating-card floating-rating">
            <Star size={14} fill="currentColor" />
            <strong>{rating.toFixed(1)}</strong>
            <span>{reviews} reviews</span>
          </div>
        )}

        <div className="floating-card floating-shipping">
          <ShieldCheck size={15} />
          <span>30-day returns</span>
        </div>
      </div>
    </section>
  );
}
