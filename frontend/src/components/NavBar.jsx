import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function navLinkClass({ isActive }) {
  return isActive ? 'nav-link is-active' : 'nav-link';
}

function initialsOf(name) {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          Campus Events
        </NavLink>
        <nav aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Events
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/events/new" className={navLinkClass}>
              Create Event
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/my-registrations" className={navLinkClass}>
              My Registrations
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          )}
          {isAuthenticated ? (
            <span className="user-chip">
              <span className="user-chip-avatar" aria-hidden="true">
                {initialsOf(user?.name)}
              </span>
              <button type="button" onClick={handleLogout}>
                Log out{user ? ` (${user.name})` : ''}
              </button>
            </span>
          ) : (
            <>
              <span className="nav-divider" aria-hidden="true" />
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
