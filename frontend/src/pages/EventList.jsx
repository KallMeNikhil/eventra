import React, { useEffect, useState } from 'react';
import { listEvents } from '../api/events';
import EventCard from '../components/EventCard';

const FILTERS = [
  { value: 'true', label: 'Upcoming' },
  { value: 'false', label: 'Past' },
  { value: '', label: 'All' },
];

export default function EventList() {
  const [state, setState] = useState({ status: 'loading', events: [], pagination: null });
  const [page, setPage] = useState(1);
  const [upcoming, setUpcoming] = useState('true');

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));

    listEvents({ page, upcoming: upcoming || undefined })
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'success', events: data.events, pagination: data.pagination });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ status: 'error', events: [], pagination: null, error: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, upcoming]);

  function handleFilterChange(value) {
    setPage(1);
    setUpcoming(value);
  }

  const activeLabel = FILTERS.find((f) => f.value === upcoming)?.label || 'events';

  return (
    <div className="page">
      <div className="hero">
        <div>
          <h1 className="hero-heading">What&rsquo;s happening <br/> around the campus</h1>
          <p className="hero-sub">
            Browse what&rsquo;s coming up, save your spot, and keep track of everything
            you&rsquo;ve signed up for in one place.
          </p>
        </div>
        <div className="filter-label">
          <span id="filter-label-text">Showing</span>
          <div className="segmented" role="group" aria-labelledby="filter-label-text">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={upcoming === f.value}
                onClick={() => handleFilterChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.status === 'loading' && <p className="loading-line" aria-busy="true">Loading events&hellip;</p>}
      {state.status === 'error' && (
        <p className="alert form-error" role="alert">
          Could not load events: {state.error}
        </p>
      )}
      {state.status === 'success' && state.events.length === 0 && (
        <div className="empty-state">
          <h2>No {activeLabel.toLowerCase()} events yet</h2>
          <p>
            Nothing to show here right now. Check back soon, or switch the filter above to see
            events in a different window.
          </p>
        </div>
      )}

      {state.status === 'success' && state.events.length > 0 && (
        <div className="event-grid">
          {state.events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      {state.pagination && state.pagination.pages > 1 && (
        <div className="pagination">
          <button type="button" className="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {state.pagination.page} of {state.pagination.pages}
          </span>
          <button
            type="button"
            className="secondary"
            disabled={page >= state.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
