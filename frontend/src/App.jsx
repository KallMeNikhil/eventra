import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import CreateEditEvent from './pages/CreateEditEvent';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyRegistrations from './pages/MyRegistrations';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <NavBar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <CreateEditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute>
                <CreateEditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
