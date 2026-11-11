import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  api,
  clearStoredSession,
  getErrorMessage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../services/api';

const storedToken = getStoredToken();
const storedUser = getStoredUser();

const rejectedPayload = (error) => ({
  message: getErrorMessage(error),
  status: error?.status ?? null,
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await api.login(credentials);
      setStoredToken(data.token);
      setStoredUser(data.user);
      return data;
    } catch (error) {
      return rejectWithValue(rejectedPayload(error));
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (details, { rejectWithValue }) => {
    try {
      const data = await api.register(details);
      setStoredUser(data.user);

      // Registration returns the user. Sign in straight away so the storefront
      // can immediately use the JWT for authenticated product operations.
      const session = await api.login({
        email: details.email,
        password: details.password,
      });
      setStoredToken(session.token);
      setStoredUser(session.user);

      return session;
    } catch (error) {
      return rejectWithValue(rejectedPayload(error));
    }
  },
);

export const loadProfile = createAsyncThunk(
  'auth/loadProfile',
  async (_, { rejectWithValue }) => {
    const token = getStoredToken();

    if (!token) {
      return rejectWithValue({ message: 'No stored session.', status: null });
    }

    try {
      const data = await api.getProfile(token);
      setStoredUser(data.user);
      return data.user;
    } catch (error) {
      if (error?.status === 401) {
        clearStoredSession();
      }
      return rejectWithValue(rejectedPayload(error));
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  clearStoredSession();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    isAuthenticated: Boolean(storedToken),
    loading: false,
    profileLoading: false,
    error: null,
    initialized: !storedToken,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Sign in failed.';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed.';
      })
      .addCase(loadProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.initialized = true;
        state.error = action.payload?.message || 'Stored session could not be verified.';

        // Only a rejected token should sign the user out. A temporary network
        // failure should not destroy a valid local session.
        if (action.payload?.status === 401) {
          state.token = '';
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = '';
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.initialized = true;
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;

export default authSlice.reducer;
