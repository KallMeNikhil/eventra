import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EventDetail from '../EventDetail';
import { AuthProvider } from '../../context/AuthContext';
import * as eventsApi from '../../api/events';
import * as usersApi from '../../api/users';

vi.mock('../../api/events');
vi.mock('../../api/users');

const baseEvent = {
  _id: 'evt1',
  title: 'Career Fair',
  description: 'Meet employers',
  dateTime: new Date(Date.now() + 86400000).toISOString(),
  location: 'Main Hall',
  capacity: 5,
  registrationCount: 3,
  status: 'upcoming',
  createdBy: { _id: 'owner1', name: 'Organizer' },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/events/evt1']}>
      <AuthProvider>
        <Routes>
          <Route path="/events/:id" element={<EventDetail />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('EventDetail registration UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('campus_event_token', 'valid-token');
    usersApi.getMe.mockResolvedValue({ user: { id: 'student1', name: 'Student' } });
    usersApi.getMyRegistrations.mockResolvedValue({ registrations: [] });
    eventsApi.getEvent.mockResolvedValue({ event: baseEvent });
  });

  it('waits for the server response before showing a registration as confirmed', async () => {
    let resolveRegister;
    eventsApi.registerForEvent.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve;
      })
    );

    const user = userEvent.setup();
    renderPage();

    const registerButton = await screen.findByRole('button', { name: /^register$/i });
    await user.click(registerButton);

    expect(screen.getByRole('button', { name: /^register$/i })).toBeDisabled();
    expect(screen.queryByText(/you are registered/i)).not.toBeInTheDocument();
    expect(screen.getByText('Capacity: 3 / 5')).toBeInTheDocument();

    eventsApi.getEvent.mockResolvedValue({
      event: { ...baseEvent, registrationCount: 4 },
    });
    resolveRegister({});

    await waitFor(() => expect(screen.getByText(/you are registered/i)).toBeInTheDocument());
    expect(screen.getByText('Capacity: 4 / 5')).toBeInTheDocument();
    expect(eventsApi.getEvent).toHaveBeenCalledTimes(2);
  });
});
