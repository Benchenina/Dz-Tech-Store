import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
  X,
} from 'lucide-react';
import {
  clearAuthError,
  loginUser,
  registerUser,
  selectAuth,
} from '../redux/authSlice';

export default function AuthModal({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(selectAuth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const emailRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => emailRef.current?.focus(), 60);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [onClose]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, mode]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setLocalError('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setLocalError('');
    dispatch(clearAuthError());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    if (mode === 'register' && form.name.trim().length < 2) {
      setLocalError('Enter your name using at least 2 characters.');
      return;
    }

    if (!form.email.trim()) {
      setLocalError('Enter your email address.');
      return;
    }

    if (form.password.length < 8) {
      setLocalError('Your password must contain at least 8 characters.');
      return;
    }

    const action =
      mode === 'login'
        ? loginUser({ email: form.email.trim(), password: form.password })
        : registerUser({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          });

    try {
      const result = await dispatch(action).unwrap();
      onSuccess(result.user, mode);
    } catch {
      // The rejected thunk already stores the API message in Redux.
    }
  };

  const message = localError || error;

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
        className="modal-card auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">DZ Tech account</p>
            <h2 className="modal-title" id="auth-title">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close authentication dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab${mode === 'login' ? ' is-active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab${mode === 'register' ? ' is-active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>

        {message && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="form-field">
              <span>Full name</span>
              <span className="input-shell">
                <UserRound size={15} aria-hidden="true" />
                <input
                  type="text"
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  minLength={2}
                />
              </span>
            </label>
          )}

          <label className="form-field">
            <span>Email address</span>
            <span className="input-shell">
              <Mail size={15} aria-hidden="true" />
              <input
                ref={emailRef}
                type="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="form-field">
            <span>Password</span>
            <span className="input-shell">
              <LockKeyhole size={15} aria-hidden="true" />
              <input
                type="password"
                value={form.password}
                onChange={updateField('password')}
                placeholder={
                  mode === 'register'
                    ? 'At least 8 characters'
                    : 'Your password'
                }
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
                required
                minLength={8}
              />
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-primary modal-submit"
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle
                className="spinner"
                size={17}
                aria-hidden="true"
              />
            ) : (
              <LockKeyhole size={16} aria-hidden="true" />
            )}
            {loading
              ? mode === 'login'
                ? 'Signing in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login'
            ? 'New to DZ Tech Store?'
            : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in instead'}
          </button>
        </p>
      </div>
    </div>
  );
}
