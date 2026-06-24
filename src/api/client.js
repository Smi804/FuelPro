// ─────────────────────────────────────────────────────────────────────────
//  API client — every backend call should go through this so they all share
//  the same base URL (see ./config.js), auth header and error handling.
//
//  Usage:
//    import { api } from '../api/client.js';
//    const stations = await api.get('stations');
//    const created  = await api.post('stations', { name: 'New' });
//    await api.del(`stations/${id}`);
//
//  Pass a FormData body to upload files (Content-Type is handled for you).
// ─────────────────────────────────────────────────────────────────────────

import { API_BASE_URL } from './config.js';

// Matches the keys written by the auth layer (see src/auth/AuthContext.jsx).
const TOKEN_KEY = 'fp_token';
const STATION_KEY = 'fp_station';

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * The active station id chosen in the topbar (persisted by the auth layer).
 * Returns null when "all" / unset so callers can require an explicit station.
 */
export function getStationId() {
  try {
    const v = localStorage.getItem(STATION_KEY);
    return v && v !== 'all' ? v : null;
  } catch {
    return null;
  }
}

/** Join a relative path with the base URL. Absolute URLs pass through. */
export function buildUrl(path = '') {
  if (/^https?:\/\//i.test(path)) return path;
  return API_BASE_URL + String(path).replace(/^\/+/, '');
}

/**
 * Core request helper.
 * @param {string} path  relative path (e.g. "stations/1") or absolute URL
 * @param {object} opts  { method, body, headers, signal, ... fetch options }
 */
export async function request(path, { method = 'GET', body, headers, ...rest } = {}) {
  const token = getToken();
  const stationId = getStationId();
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const hasBody = body !== undefined && body !== null;

  let res;
  try {
    res = await fetch(buildUrl(path), {
      method,
      headers: {
        Accept: 'application/json',
        ...(hasBody && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(stationId ? { 'Station-Id': stationId } : {}),
        ...headers
      },
      body: hasBody ? (isForm ? body : JSON.stringify(body)) : undefined,
      ...rest
    });
  } catch (cause) {
    // Network failure / CORS / server unreachable — surface as status 0.
    const error = new Error('Network error — could not reach the server.');
    error.status = 0;
    error.cause = cause;
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const message = (data && data.message) || res.statusText || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' })
};

export { API_BASE_URL };
export default api;
