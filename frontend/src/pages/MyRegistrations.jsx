import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRegistrations } from '../api/users';
import { cancelRegistration } from '../api/events';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MyRegistrations() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmEventId, setConfirmEventId] = useState(null);

  function load() {
    setStatus('loading');
    getMyRegistrations(token)
      .then((data) => {
        setRegistrations(data.registrations);
        setStatus('success');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(load, [token]);

  async function handleCancel(eventId) {
    if (cancellingId) {
      return;
    }
    setCancellingId(eventId);
    try {
      await cancelRegistration(eventId, token);
      setConfirmEventId(null);
      load();
    } catch (err) {
      setError(err.message);
      setConfirmEventId(null);
    } finally {
      setCancellingId(null);
    }
  }

  if (status === 'loading') {
    return <p className="loading-line" aria-busy="true">Loading your registrations&hellip;</p>;
  }

  if (status === 'error') {
    return (
      <p className="alert form-error" role="alert">
        {error}
      </p>
    );
  }

  const activeRegistrations = registrations.filter((r) => r.event);

  return (
    <div className="page">
      <span className="eyebrow">Your schedule</span>
      <h1 style={{ marginTop: '0.5rem' }}>My Registrations</h1>

      {activeRegistrations.length === 0 && (
        <div className="empty-state">
          <h2>Nothing on your schedule yet</h2>
          <p>Register for an event and it will show up here.</p>
          <Link className="text-link" to="/">Browse events</Link>
        </div>
      )}

      {activeRegistrations.length > 0 && (
        <ul className="registration-list">
          {activeRegistrations.map((r) => (
            <li key={r._id}>
              <div>
                <h3>
                  <Link className="text-link" to={`/events/${r.event._id}`}>
                    {r.event.title}
                  </Link>
                </h3>
                <p className="event-meta">
                  {new Date(r.event.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => setConfirmEventId(r.event._id)}
                disabled={cancellingId === r.event._id}
                aria-busy={cancellingId === r.event._id}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(confirmEventId)}
        title="Cancel this registration?"
        message="You will need to register again if you change your mind and the event still has space."
        confirmLabel="Cancel registration"
        confirmBusy={Boolean(cancellingId)}
        onConfirm={() => handleCancel(confirmEventId)}
        onCancel={() => setConfirmEventId(null)}
      />
    </div>
  );
}
