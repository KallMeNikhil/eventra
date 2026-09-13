import React from 'react';
import { Link } from 'react-router-dom';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function EventCard({ event }) {
  const isFull = event.registrationCount >= event.capacity;
  const isPast = event.status === 'past';
  const date = new Date(event.dateTime);
  const dateLabel = date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  let badgeClass = 'badge-accent';
  let badgeLabel = `${event.capacity - event.registrationCount} spots left`;
  if (isPast) {
    badgeClass = 'badge-muted';
    badgeLabel = 'Past event';
  } else if (isFull) {
    badgeClass = 'badge-danger';
    badgeLabel = 'Full';
  }

  return (
    <article className="event-card">
      <div className="event-card-stub" aria-hidden="true">
        <span className="stub-month">{MONTHS[date.getMonth()]}</span>
        <span className="stub-day">{date.getDate()}</span>
        <span className="stub-time">{timeLabel}</span>
      </div>
      <div className="event-card-body">
        <h3>
          <Link to={`/events/${event._id}`}>{event.title}</Link>
        </h3>
        <p className="event-meta">
          <span>{dateLabel}</span>
          <span className="dot-sep" aria-hidden="true">&middot;</span>
          <span>{event.location}</span>
        </p>
        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
      </div>
    </article>
  );
}
