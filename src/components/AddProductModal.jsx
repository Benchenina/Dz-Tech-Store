import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  LoaderCircle,
  PackagePlus,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  clearProductError,
  createProduct,
  selectMutationError,
  selectMutationStatus,
} from '../redux/productSlice';

const initialForm = {
  name: '',
  price: '',
  oldPrice: '',
  category: 'Audio',
  image: '',
  stock: '1',
  badge: '',
  description: '',
  featured: false,
};

export default function AddProductModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const status = useSelector(selectMutationStatus);
  const mutationError = useSelector(selectMutationError);
  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearProductError());
  }, [dispatch]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const updateField = (field) => (event) => {
    const value =
      event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setLocalError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    if (form.name.trim().length < 2) {
      setLocalError('Product name must contain at least 2 characters.');
      return;
    }

    if (form.price.trim() === '' || Number(form.price) < 0) {
      setLocalError('Enter a valid non-negative price.');
      return;
    }

    if (form.stock.trim() === '' || Number(form.stock) < 0) {
      setLocalError('Enter a valid non-negative stock quantity.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim() || 'General',
      image: form.image.trim(),
      stock: Number(form.stock),
      badge: form.badge.trim(),
      featured: form.featured,
    };

    if (form.oldPrice.trim() !== '') {
      payload.oldPrice = Number(form.oldPrice);
    }

    try {
      const product = await dispatch(createProduct(payload)).unwrap();
      onCreated(product);
    } catch {
      // The rejected thunk already stores the API message in Redux.
    }
  };

  const message = localError || mutationError;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-card add-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
      >
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">Store administration</p>
            <h2 className="modal-title" id="add-product-title">
              Add a product
            </h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close add product dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="modal-description">
          Create a product through the protected API. The request uses the JWT
          stored in this browser.
        </p>

        {message && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Product name</span>
            <input
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Aurora Pro Headphones"
              required
              minLength={2}
            />
          </label>

          <div className="form-grid two-col">
            <label className="form-field">
              <span>Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={updateField('price')}
                placeholder="249"
                required
              />
            </label>

            <label className="form-field">
              <span>Old price (optional)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.oldPrice}
                onChange={updateField('oldPrice')}
                placeholder="299"
              />
            </label>
          </div>

          <div className="form-grid two-col">
            <label className="form-field">
              <span>Category</span>
              <input
                type="text"
                value={form.category}
                onChange={updateField('category')}
                placeholder="Audio"
              />
            </label>

            <label className="form-field">
              <span>Stock</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={updateField('stock')}
                placeholder="12"
                required
              />
            </label>
          </div>

          <label className="form-field">
            <span>Image URL</span>
            <input
              type="url"
              value={form.image}
              onChange={updateField('image')}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </label>

          <label className="form-field">
            <span>Badge (optional)</span>
            <input
              type="text"
              value={form.badge}
              onChange={updateField('badge')}
              placeholder="New"
              maxLength={40}
            />
          </label>

          <label className="form-field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={updateField('description')}
              placeholder="Describe what makes this product worth adding to the catalogue."
              rows={4}
            />
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={updateField('featured')}
            />
            <span>Feature this product in the hero section</span>
          </label>

          <div className="modal-note">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Protected with a Bearer token and saved to MongoDB.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary modal-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <LoaderCircle className="spinner" size={17} aria-hidden="true" />
            ) : (
              <PackagePlus size={17} aria-hidden="true" />
            )}
            {status === 'loading' ? 'Saving product...' : 'Add product'}
          </button>
        </form>
      </div>
    </div>
  );
}
