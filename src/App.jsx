import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  ChevronDown,
  LoaderCircle,
  PackageSearch,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import AddProductModal from './components/AddProductModal';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import StatusToast from './components/StatusToast';
import {
  loadProfile,
  logoutUser,
  selectAuth,
} from './redux/authSlice';
import {
  fetchProducts,
  selectProductError,
  selectProductStatus,
  selectProducts,
} from './redux/productSlice';
import './App.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

export default function App() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const productStatus = useSelector(selectProductStatus);
  const productError = useSelector(selectProductError);
  const { token, initialized, isAuthenticated } = useSelector(selectAuth);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (productStatus === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, productStatus]);

  useEffect(() => {
    if (token && !initialized) {
      dispatch(loadProfile());
    }
  }, [dispatch, initialized, token]);

  const showNotice = useCallback((type, title, message) => {
    setNotice({ id: Date.now(), type, title, message });
  }, []);

  const closeNotice = useCallback(() => setNotice(null), []);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    setIsAddProductOpen(false);
    showNotice('info', 'Signed out', 'Your JWT was removed from this browser.');
  }, [dispatch, showNotice]);

  const handleAuthSuccess = useCallback(
    (user, mode) => {
      setIsAuthOpen(false);
      showNotice(
        'success',
        mode === 'register' ? 'Account created' : 'Welcome back',
        `Signed in as ${user.name}.`,
      );
    },
    [showNotice],
  );

  const handleProductCreated = useCallback(
    (product) => {
      setIsAddProductOpen(false);
      showNotice(
        'success',
        'Product added',
        `${product.name} is now saved in MongoDB and visible in the catalogue.`,
      );
    },
    [showNotice],
  );

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const featuredProduct =
    products.find((product) => product.featured) ?? products[0] ?? null;

  const categories = useMemo(
    () => [
      'All',
      ...new Set(
        products
          .map((product) => product.category)
          .filter((category) => Boolean(category)),
      ),
    ],
    [products],
  );

  const categoryCounts = useMemo(
    () =>
      products.reduce((counts, product) => {
        counts[product.category] = (counts[product.category] ?? 0) + 1;
        return counts;
      }, {}),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();

    const matchingProducts = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        String(product.name || '').toLowerCase().includes(query) ||
        String(product.category || '').toLowerCase().includes(query) ||
        String(product.description || '').toLowerCase().includes(query);

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
  }, [deferredSearchTerm, products, selectedCategory, sortBy]);

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

  const retryProducts = useCallback(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="app">
      <a className="skip-link" href="#catalog">
        Skip to catalog
      </a>

      <Header
        onOpenCart={openCart}
        onBrowseCategory={browseCategory}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddProduct={() => {
          if (isAuthenticated) {
            setIsAddProductOpen(true);
          } else {
            setIsAuthOpen(true);
          }
        }}
        onLogout={handleLogout}
      />

      <main>
        <Hero
          featuredProduct={featuredProduct}
          productCount={products.length}
          onShop={scrollToCatalog}
          isLoading={productStatus === 'loading'}
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

          {productStatus === 'loading' && products.length === 0 && (
            <div className="catalog-state" role="status" aria-live="polite">
              <LoaderCircle
                className="spinner"
                size={30}
                aria-hidden="true"
              />
              <h3>Loading the catalogue</h3>
              <p>Fetching products from the DZ Tech Store API.</p>
            </div>
          )}

          {productStatus === 'failed' && products.length === 0 && (
            <div className="catalog-state is-error" role="alert">
              <AlertCircle size={30} aria-hidden="true" />
              <h3>The catalogue is offline</h3>
              <p>{productError}</p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={retryProducts}
              >
                <RefreshCw size={15} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {productStatus === 'failed' && products.length > 0 && (
            <div className="catalog-alert" role="status">
              <AlertCircle size={15} aria-hidden="true" />
              <span>{productError} Showing the last loaded catalogue.</span>
              <button type="button" onClick={retryProducts}>
                Retry
              </button>
            </div>
          )}

          {products.length > 0 && (
            <ProductList
              products={filteredProducts}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}

          {productStatus === 'succeeded' && products.length === 0 && (
            <div className="catalog-state">
              <PackageSearch size={30} aria-hidden="true" />
              <h3>The catalogue is empty</h3>
              <p>
                Sign in as an administrator and add the first product to
                MongoDB.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        onBrowse={browseFromCart}
      />

      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {isAddProductOpen && isAuthenticated && (
        <AddProductModal
          onClose={() => setIsAddProductOpen(false)}
          onCreated={handleProductCreated}
        />
      )}

      <StatusToast notice={notice} onClose={closeNotice} />
    </div>
  );
}
