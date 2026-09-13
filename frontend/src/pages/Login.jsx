import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in</h1>
        <p className="auth-sub">Pick up where you left off &mdash; your saved spots are waiting.</p>
        <form onSubmit={handleSubmit} noValidate>
          <FormField id="email" label="Email">
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField id="password" label="Password">
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormField>
          {error && (
            <p className="alert form-error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link className="text-link" to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
