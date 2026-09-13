import request from './client';

export function listEvents({ page = 1, limit = 12, upcoming } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (upcoming !== undefined) {
    params.set('upcoming', upcoming);
  }
  return request(`/events?${params.toString()}`);
}

export function getEvent(id) {
  return request(`/events/${id}`);
}

export function createEvent(data, token) {
  return request('/events', { method: 'POST', body: data, token });
}

export function updateEvent(id, data, token) {
  return request(`/events/${id}`, { method: 'PATCH', body: data, token });
}

export function deleteEvent(id, token) {
  return request(`/events/${id}`, { method: 'DELETE', token });
}

export function registerForEvent(id, token) {
  return request(`/events/${id}/register`, { method: 'POST', token });
}

export function cancelRegistration(id, token) {
  return request(`/events/${id}/register`, { method: 'DELETE', token });
}
