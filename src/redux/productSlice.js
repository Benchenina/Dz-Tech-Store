import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  api,
  getErrorMessage,
  normalizeProduct,
} from '../services/api';

const rejectedPayload = (error) => ({
  message: getErrorMessage(error),
  status: error?.status ?? null,
});

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.fetchProducts();
      return Array.isArray(data) ? data.map(normalizeProduct) : [];
    } catch (error) {
      return rejectWithValue(rejectedPayload(error));
    }
  },
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (product, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue({
        message: 'Sign in before adding a product.',
        status: 401,
      });
    }

    try {
      return normalizeProduct(await api.createProduct(product, token));
    } catch (error) {
      return rejectWithValue(rejectedPayload(error));
    }
  },
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, changes }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue({
        message: 'Sign in before updating a product.',
        status: 401,
      });
    }

    try {
      return normalizeProduct(await api.updateProduct(id, changes, token));
    } catch (error) {
      return rejectWithValue(rejectedPayload(error));
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue({
        message: 'Sign in before deleting a product.',
        status: 401,
      });
    }

    try {
      await api.deleteProduct(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(rejectedPayload(error));
    }
  },
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    mutationStatus: 'idle',
    mutationError: null,
  },
  reducers: {
    clearProductError(state) {
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'The catalogue could not be loaded.';
      })
      .addCase(createProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.mutationError = null;
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload?.message || 'The product could not be created.';
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.mutationError = null;
        const index = state.items.findIndex((item) => item.id === action.payload.id);

        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload?.message || 'The product could not be updated.';
      })
      .addCase(deleteProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.mutationError = null;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload?.message || 'The product could not be deleted.';
      });
  },
});

export const { clearProductError } = productSlice.actions;

export const selectProducts = (state) => state.products.items;
export const selectProductStatus = (state) => state.products.status;
export const selectProductError = (state) => state.products.error;
export const selectMutationStatus = (state) => state.products.mutationStatus;
export const selectMutationError = (state) => state.products.mutationError;

export default productSlice.reducer;
