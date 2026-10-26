import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Check, Cpu, Plus, Star } from 'lucide-react';
import { addToCart } from '../redux/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProductCard({ product, style }) {
  const dispatch = useDispatch();
  const [justAdded, setJustAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const resetTimerRef = useRef(null);

  const hasDiscount = product.oldPrice && product.oldPrice > product.price;

  useEffect(
    () => () => {
      window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    setJustAdded(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article className="product-card" style={style}>
      <div className="product-media">
        {imageFailed ? (
          <div className="product-image-fallback">
            <Cpu size={38} strokeWidth={1.5} aria-hidden="true" />
            <span>{product.category}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            width="900"
            height="675"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}

        <div className="product-badges">
          {product.badge && (
            <span className={`badge badge-${product.badge.toLowerCase()}`}>
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="badge badge-sale">
              Save {formatCurrency(product.oldPrice - product.price)}
            </span>
          )}
        </div>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-rating">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            {product.rating.toFixed(1)}
            <span>({product.reviews})</span>
          </span>
        </div>

        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <div className="price-group">
            <span className="product-price">{formatCurrency(product.price)}</span>
            {hasDiscount && (
              <span className="product-old-price">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            className={`add-to-cart-btn${justAdded ? ' is-added' : ''}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check size={15} aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <Plus size={15} aria-hidden="true" />
                Add
              </>
            )}
          </button>
        </div>
      </div>

      <span className="sr-only" role="status">
        {justAdded ? `${product.name} added to cart` : ''}
      </span>
    </article>
  );
}
