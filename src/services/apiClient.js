export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BACKEND_ENABLED = import.meta.env.VITE_BACKEND_ENABLED !== 'false';

const CSRF_COOKIE = 'glowoutgh_csrf';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Reads the (non-httpOnly) CSRF cookie the backend sets at login, so we can
// echo it back in a header on state-changing requests (double-submit pattern).
function getCsrfToken() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

// The auth JWT now lives in an httpOnly cookie that JavaScript cannot read,
// which is the whole point — it can't be stolen via XSS. These token helpers
// are kept as no-ops so existing callers don't break; the browser sends the
// cookie automatically with credentials: 'include'.
export function getAuthToken() {
  return '';
}
export function setAuthToken() {
  /* no-op: auth is handled by an httpOnly cookie set by the server */
}
export function clearAuthToken() {
  /* no-op: call the /auth/logout endpoint to clear the server cookie */
}

export async function apiRequest(path, options = {}) {
  if (!BACKEND_ENABLED) throw new Error('Backend API is disabled by VITE_BACKEND_ENABLED=false.');
  const method = (options.method || 'GET').toUpperCase();
  const isForm = options.body instanceof FormData;
  const headers = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(MUTATING_METHODS.has(method) ? { 'X-CSRF-Token': getCsrfToken() } : {}),
    ...(options.headers || {})
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include' // send/receive the auth + CSRF cookies
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.errors?.message || `API request failed: ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload?.data ?? payload;
}

export function withQuery(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function healthApi() {
  return apiRequest('/health');
}
