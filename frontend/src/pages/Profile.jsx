import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api/users';
import FormField from '../components/FormField';

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('working');
    setError('');
    try {
      const data = await updateMe({ name }, token);
      setUser(data.user);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="page-narrow">
      <span className="eyebrow">Your account</span>
      <h1 style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Profile</h1>
      <div className="surface-card">
        <form onSubmit={handleSubmit} noValidate>
          <FormField id="email" label="Email">
            <input id="email" type="email" value={user?.email || ''} disabled />
          </FormField>
          <FormField id="name" label="Name">
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          {status === 'success' && (
            <p role="status" aria-live="polite" className="alert form-success">
              Profile updated.
            </p>
          )}
          {error && (
            <p className="alert form-error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
          <button type="submit" disabled={status === 'working'} aria-busy={status === 'working'}>
            {status === 'working' ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
