import { PackageSearch, RotateCcw } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductList({ products, hasActiveFilters, onClearFilters }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          <PackageSearch size={28} />
        </div>
        <h3>No products found</h3>
        <p>
          {hasActiveFilters
            ? 'Nothing matches that search and category combination. Try a broader term or reset the filters.'
            : 'The collection is taking a quick break. Please check back shortly.'}
        </p>
        {hasActiveFilters && (
          <button type="button" className="btn btn-ghost" onClick={onClearFilters}>
            <RotateCcw size={15} aria-hidden="true" />
            Reset filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          style={{ '--delay': `${Math.min(index * 35, 280)}ms` }}
        />
      ))}
    </div>
  );
}
