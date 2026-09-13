import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as eventsApi from '../api/events';
import FormField from '../components/FormField';

function toLocalInputValue(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function CreateEditEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [form, setForm] = useState({ title: '', description: '', dateTime: '', location: '', capacity: 10 });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    eventsApi
      .getEvent(id)
      .then((data) => {
        const event = data.event;
        if (event.createdBy?._id !== user?.id) {
          setLoadError('You do not have permission to edit this event.');
          return;
        }
        setForm({
          title: event.title,
          description: event.description,
          dateTime: toLocalInputValue(event.dateTime),
          location: event.location,
          capacity: event.capacity,
        });
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      dateTime: new Date(form.dateTime).toISOString(),
      location: form.location,
      capacity: Number(form.capacity),
    };
    try {
      if (isEdit) {
        await eventsApi.updateEvent(id, payload, token);
        navigate(`/events/${id}`);
      } else {
        const created = await eventsApi.createEvent(payload, token);
        navigate(`/events/${created.event._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="loading-line" aria-busy="true">Loading&hellip;</p>;
  }

  if (loadError) {
    return (
      <p className="alert form-error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <div className="page-narrow">
      <span className="eyebrow">{isEdit ? 'Update details' : 'New listing'}</span>
      <h1 style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
        {isEdit ? 'Edit Event' : 'Create Event'}
      </h1>
      <div className="surface-card">
        <form onSubmit={handleSubmit} noValidate>
          <FormField id="title" label="Title">
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>
          <FormField id="description" label="Description">
            <textarea
              id="description"
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
          <FormField id="dateTime" label="Date and time">
            <input
              id="dateTime"
              type="datetime-local"
              required
              value={form.dateTime}
              onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
            />
          </FormField>
          <FormField id="location" label="Location">
            <input
              id="location"
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </FormField>
          <FormField id="capacity" label="Capacity">
            <input
              id="capacity"
              type="number"
              min={1}
              required
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </FormField>
          {error && (
            <p className="alert form-error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
          </button>
        </form>
      </div>
    </div>
  );
}
