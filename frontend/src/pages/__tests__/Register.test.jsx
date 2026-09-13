import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';
import { AuthProvider } from '../../context/AuthContext';
import * as authApi from '../../api/auth';

vi.mock('../../api/auth');
vi.mock('../../api/users', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('no user')),
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Register form validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('blocks submission when password is too short', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText('Name'), 'Jane Student');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('submits when the password meets the minimum length', async () => {
    authApi.register.mockResolvedValue({});
    authApi.login = vi.fn().mockResolvedValue({ token: 'abc', user: { id: '1', name: 'Jane' } });
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText('Name'), 'Jane Student');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'longenoughpassword');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => expect(authApi.register).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
