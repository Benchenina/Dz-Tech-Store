import { ArrowDown, Sparkles, Star, ShieldCheck, Truck } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function Hero({ featuredProduct, productCount, onShop }) {
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
            <strong>{productCount}</strong>
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
          <img
            className="spotlight-image"
            src={featuredProduct.image}
            alt=""
            width="900"
            height="675"
          />
          <div className="spotlight-info">
            <div>
              <h3>{featuredProduct.name}</h3>
              <p>{featuredProduct.category} · Wireless</p>
            </div>
            <span className="spotlight-price">
              {formatCurrency(featuredProduct.price)}
            </span>
          </div>
        </div>

        <div className="floating-card floating-rating">
          <Star size={14} fill="currentColor" />
          <strong>{featuredProduct.rating}</strong>
          <span>{featuredProduct.reviews} reviews</span>
        </div>

        <div className="floating-card floating-shipping">
          <ShieldCheck size={15} />
          <span>30-day returns</span>
        </div>
      </div>
    </section>
  );
}
