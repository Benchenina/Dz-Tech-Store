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

  const productId = String(product.id || product._id || '');
  const imageSrc = product.image || product.imageUrl || '';
  const rating = Number(product.rating) || 0;
  const reviews = Number(product.reviews) || 0;
  const oldPrice = Number(product.oldPrice);
  const hasDiscount = Number.isFinite(oldPrice) && oldPrice > product.price;
  const badgeClass = String(product.badge || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  useEffect(
    () => () => {
      window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...product,
        id: productId,
        image: imageSrc,
      }),
    );
    setJustAdded(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article className="product-card" style={style}>
      <div className="product-media">
        {!imageSrc || imageFailed ? (
          <div className="product-image-fallback">
            <Cpu size={38} strokeWidth={1.5} aria-hidden="true" />
            <span>{product.category}</span>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={product.name}
            width="900"
            height="675"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}

        <div className="product-badges">
          {product.badge && (
            <span className={`badge badge-${badgeClass}`}>{product.badge}</span>
          )}
          {hasDiscount && (
            <span className="badge badge-sale">
              Save {formatCurrency(oldPrice - product.price)}
            </span>
          )}
        </div>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          {rating > 0 && (
            <span className="product-rating">
              <Star size={12} fill="currentColor" aria-hidden="true" />
              {rating.toFixed(1)}
              <span>({reviews})</span>
            </span>
          )}
        </div>

        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <div className="price-group">
            <span className="product-price">{formatCurrency(product.price)}</span>
            {hasDiscount && (
              <span className="product-old-price">
                {formatCurrency(oldPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            className={`add-to-cart-btn${justAdded ? ' is-added' : ''}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            disabled={!productId}
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
