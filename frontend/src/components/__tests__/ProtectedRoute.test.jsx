import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';
import * as usersApi from '../../api/users';

vi.mock('../../api/users');

function renderApp(initialEntries) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Profile Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects unauthenticated users to login', async () => {
    renderApp(['/profile']);
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Profile Page')).not.toBeInTheDocument();
  });

  it('renders the protected page for an authenticated user', async () => {
    localStorage.setItem('campus_event_token', 'valid-token');
    usersApi.getMe.mockResolvedValue({ user: { id: '1', name: 'Jane' } });

    renderApp(['/profile']);

    expect(await screen.findByText('Profile Page')).toBeInTheDocument();
  });
});
