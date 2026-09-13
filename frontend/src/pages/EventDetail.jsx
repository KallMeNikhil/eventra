import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as eventsApi from '../api/events';
import { getMyRegistrations } from '../api/users';
import ConfirmDialog from '../components/ConfirmDialog';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState('idle');
  const [actionMessage, setActionMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);

  const loadEvent = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await eventsApi.getEvent(id);
      setEvent(data.event);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated || !token) {
      setMyRegistration(null);
      return undefined;
    }
    getMyRegistrations(token).then((data) => {
      if (cancelled) return;
      const found = data.registrations.find((r) => r.event && r.event._id === id);
      setMyRegistration(found || null);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, id, actionState]);

  const isOwner = isAuthenticated && event && user && event.createdBy?._id === user.id;
  const isFull = event && event.registrationCount >= event.capacity;
  const isPast = event && event.status === 'past';

  async function handleRegister() {
    setActionState('working');
    setActionMessage('');
    try {
      await eventsApi.registerForEvent(id, token);
      setActionMessage('You are registered for this event.');
      setActionState('success');
      loadEvent();
    } catch (err) {
      setActionMessage(err.message);
      setActionState('error');
    }
  }

  async function handleCancel() {
    if (actionState === 'working') {
      return;
    }
    setActionState('working');
    setActionMessage('');
    try {
      await eventsApi.cancelRegistration(id, token);
      setActionMessage('Your registration was cancelled.');
      setActionState('success');
      setCancelConfirmOpen(false);
      loadEvent();
    } catch (err) {
      setActionMessage(err.message);
      setActionState('error');
      setCancelConfirmOpen(false);
    }
  }

  async function handleDelete() {
    if (deleteBusy) {
      return;
    }
    setDeleteBusy(true);
    try {
      await eventsApi.deleteEvent(id, token);
      navigate('/', { replace: true });
    } catch (err) {
      setActionMessage(err.message);
      setActionState('error');
      setDeleteBusy(false);
      setConfirmOpen(false);
    }
  }

  if (status === 'loading') {
    return <p className="loading-line" aria-busy="true">Loading event&hellip;</p>;
  }

  if (status === 'error') {
    return (
      <p className="alert form-error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="page-narrow">
      <div className="detail-hero">
        <span className="eyebrow">{isPast ? 'Past event' : 'Upcoming event'}</span>
        <h1>{event.title}</h1>
        <div className="detail-pills">
          <span className="pill">
            {new Date(event.dateTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
          </span>
          <span className="pill">{event.location}</span>
        </div>
      </div>

      <p className="detail-description">{event.description}</p>

      <div className="surface-card" style={{ marginTop: '1.5rem' }}>
        <div className="detail-capacity-row">
          <p>
            Capacity: {event.registrationCount} / {event.capacity}
            {isFull && !isPast && <strong> (Full)</strong>}
            {isPast && <strong> (Past event)</strong>}
          </p>
          {!isPast && !isFull && <span className="badge badge-accent">Open</span>}
          {!isPast && isFull && <span className="badge badge-danger">Full</span>}
          {isPast && <span className="badge badge-muted">Closed</span>}
        </div>
        <p className="detail-host" style={{ marginTop: '0.75rem' }}>
          Hosted by {event.createdBy?.name || 'Unknown organizer'}
        </p>
      </div>

      {actionMessage && (
        <p role="status" aria-live="polite" className={`alert ${actionState === 'error' ? 'form-error' : 'form-success'}`} style={{ marginTop: '1.5rem' }}>
          {actionMessage}
        </p>
      )}

      {!isAuthenticated && (
        <p style={{ marginTop: '1.5rem' }}>
          <Link className="text-link" to="/login" state={{ from: { pathname: `/events/${id}` } }}>
            Log in
          </Link>{' '}
          to register for this event.
        </p>
      )}

      {isAuthenticated && !isOwner && !isPast && (
        <div className="detail-actions">
          {myRegistration ? (
            <button
              type="button"
              className="secondary"
              onClick={() => setCancelConfirmOpen(true)}
              disabled={actionState === 'working'}
              aria-busy={actionState === 'working'}
            >
              Cancel registration
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRegister}
              disabled={isFull || actionState === 'working'}
              aria-busy={actionState === 'working'}
            >
              {isFull ? 'Event full' : 'Register'}
            </button>
          )}
        </div>
      )}

      {isOwner && (
        <div className="owner-controls">
          <Link className="text-link" to={`/events/${id}/edit`}>
            Edit event
          </Link>
          <button type="button" className="danger" onClick={() => setConfirmOpen(true)}>
            Delete event
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this event?"
        message="This will permanently remove the event and cancel all registrations."
        confirmLabel="Delete"
        confirmBusy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel your registration?"
        message="You will need to register again if you change your mind and the event still has space."
        confirmLabel="Cancel registration"
        confirmBusy={actionState === 'working'}
        onConfirm={handleCancel}
        onCancel={() => setCancelConfirmOpen(false)}
      />
    </div>
  );
}
