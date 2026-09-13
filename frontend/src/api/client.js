const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || 'Something went wrong';
    const error = new Error(message);
    error.status = res.status;
    error.code = data?.error?.code;
    throw error;
  }

  return data;
}

export default request;
