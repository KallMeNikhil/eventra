import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-narrow">
      <div className="empty-state">
        <span className="eyebrow">404</span>
        <h2>This page wandered off campus</h2>
        <p>The page you&rsquo;re looking for doesn&rsquo;t exist, or may have moved.</p>
        <Link className="text-link" to="/">Return to the event list</Link>
      </div>
    </div>
  );
}
