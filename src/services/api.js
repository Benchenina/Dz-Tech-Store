const DEFAULT_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, '');

export const AUTH_TOKEN_KEY = 'dz-tech-store:token';
export const AUTH_USER_KEY = 'dz-tech-store:user';

function readStorage(key) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browsing or when the quota is full.
  }
}

export function getStoredToken() {
  return readStorage(AUTH_TOKEN_KEY) || '';
}

export function setStoredToken(token) {
  writeStorage(AUTH_TOKEN_KEY, token || null);
}

export function getStoredUser() {
  const rawUser = readStorage(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  writeStorage(AUTH_USER_KEY, user ? JSON.stringify(user) : null);
}

export function clearStoredSession() {
  writeStorage(AUTH_TOKEN_KEY, null);
  writeStorage(AUTH_USER_KEY, null);
}

export class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function errorMessage(data, status) {
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (status === 401) {
    return 'Your session is not valid. Please sign in again.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  return `The API request failed with status ${status}.`;
}

export function getErrorMessage(error) {
  if (error?.name === 'AbortError') {
    return 'The request timed out. Check that the backend is running.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while contacting the API.';
}

async function request(
  path,
  { method = 'GET', body, auth = false, token, signal } = {},
) {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const bearerToken = token ?? getStoredToken();

  if (auth && bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(
      'Cannot reach the API. Make sure the backend is running on port 5000.',
      null,
      null,
    );
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(errorMessage(data, response.status), response.status, data);
  }

  return data;
}

export const api = {
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  register(details) {
    return request('/auth/register', {
      method: 'POST',
      body: details,
    });
  },

  getProfile(token) {
    return request('/auth/me', {
      auth: true,
      token,
    });
  },

  fetchProducts() {
    return request('/products');
  },

  createProduct(product, token) {
    return request('/products', {
      method: 'POST',
      body: product,
      auth: true,
      token,
    });
  },

  updateProduct(id, changes, token) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: changes,
      auth: true,
      token,
    });
  },

  deleteProduct(id, token) {
    return request(`/products/${id}`, {
      method: 'DELETE',
      auth: true,
      token,
    });
  },
};

/**
 * Keeps API data predictable for Redux and React components. The backend
 * already exposes both `id` and `_id`, but normalising here protects the UI
 * from older records, legacy responses and optional storefront fields.
 */
export function normalizeProduct(product = {}) {
  const id = String(product.id || product._id || '');
  const image = product.image || product.imageUrl || '';
  const oldPrice =
    product.oldPrice === null ||
    product.oldPrice === undefined ||
    product.oldPrice === ''
      ? null
      : Number(product.oldPrice);

  return {
    ...product,
    id,
    _id: String(product._id || id),
    name: String(product.name || 'Untitled product'),
    description: String(product.description || ''),
    category: String(product.category || 'General'),
    image,
    imageUrl: product.imageUrl || image,
    price: Number(product.price) || 0,
    oldPrice: Number.isFinite(oldPrice) ? oldPrice : null,
    stock: Number(product.stock) || 0,
    rating: Number(product.rating) || 0,
    reviews: Number(product.reviews) || 0,
    badge: String(product.badge || ''),
    featured: Boolean(product.featured),
  };
}
