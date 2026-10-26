import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import { categories, products } from './data/products';
import './App.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

const categoryCounts = products.reduce((counts, product) => {
  counts[product.category] = (counts[product.category] ?? 0) + 1;
  return counts;
}, {});

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const featuredProduct = products.find((product) => product.featured) ?? products[0];

  const filteredProducts = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();

    const matchingProducts = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case 'price-asc':
        return [...matchingProducts].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...matchingProducts].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...matchingProducts].sort((a, b) => b.rating - a.rating);
      default:
        return matchingProducts;
    }
  }, [deferredSearchTerm, selectedCategory, sortBy]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 || selectedCategory !== 'All';

  const scrollToCatalog = useCallback(() => {
    document.getElementById('catalog')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const browseCategory = useCallback(
    (category) => {
      setSelectedCategory(category);
      window.requestAnimationFrame(scrollToCatalog);
    },
    [scrollToCatalog],
  );

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('featured');
  }, []);

  const browseFromCart = useCallback(() => {
    closeCart();
    scrollToCatalog();
  }, [closeCart, scrollToCatalog]);

  return (
    <div className="app">
      <a className="skip-link" href="#catalog">
        Skip to catalog
      </a>

      <Header onOpenCart={openCart} onBrowseCategory={browseCategory} />

      <main>
        <Hero
          featuredProduct={featuredProduct}
          productCount={products.length}
          onShop={scrollToCatalog}
        />

        <section
          className="catalog container"
          id="catalog"
          aria-labelledby="catalog-title"
        >
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 id="catalog-title">Featured gear</h2>
            </div>
            <p className="catalog-count" role="status" aria-live="polite">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="toolbar">
            <div className="search-field">
              <Search size={17} aria-hidden="true" />
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <input
                id="product-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search headphones, keyboards, cameras..."
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="sort-field">
              <SlidersHorizontal size={15} aria-hidden="true" />
              <label htmlFor="sort-products" className="sr-only">
                Sort products
              </label>
              <select
                id="sort-products"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="sort-chevron"
                size={15}
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            className="category-row"
            role="group"
            aria-label="Filter by category"
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              const count =
                category === 'All'
                  ? products.length
                  : (categoryCounts[category] ?? 0);

              return (
                <button
                  key={category}
                  type="button"
                  className={`category-chip${isActive ? ' is-active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isActive}
                >
                  {category}
                  <span className="chip-count">{count}</span>
                </button>
              );
            })}
          </div>

          <ProductList
            products={filteredProducts}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </section>
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        onBrowse={browseFromCart}
      />
    </div>
  );
}
