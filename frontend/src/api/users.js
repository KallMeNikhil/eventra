import request from './client';

export function getMe(token) {
  return request('/users/me', { token });
}

export function updateMe(data, token) {
  return request('/users/me', { method: 'PATCH', body: data, token });
}

export function getMyRegistrations(token) {
  return request('/users/me/registrations', { token });
}
