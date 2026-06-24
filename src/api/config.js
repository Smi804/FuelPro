// ─────────────────────────────────────────────────────────────────────────
//  API configuration — single source of truth for the backend base URL.
//
//  To change the backend URL, edit DEFAULT_BASE_URL below, OR set
//  `VITE_API_BASE_URL` in a `.env` file (the env value wins). Nothing else in
//  the app should hard-code a backend URL — always import API_BASE_URL or use
//  the `api` client from `src/api/client.js`.
// ─────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────
//  DEMO / MOCK MODE
//  While `USE_MOCK` is true the app does NOT call the real backend: logins and
//  list/CRUD endpoints (auth, stations, items, brands) return in-memory dummy
//  data instead. To go back to the real backend, set this to `false` (single
//  switch — the real fetch code is still intact in each module).
// ─────────────────────────────────────────────────────────────────────────
export const USE_MOCK = false;

const DEFAULT_BASE_URL = 'http://192.168.18.86/fuelpro_backend/api/';

const raw = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

// Always expose the base URL with exactly one trailing slash so path joining
// is predictable.
export const API_BASE_URL = raw.endsWith('/') ? raw : `${raw}/`;
