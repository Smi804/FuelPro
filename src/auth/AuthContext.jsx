import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { can as canDo } from '../domain/permissions.js';
import { getStationsDropDown } from '../api/stations.js';
import { loginRequest, adminLoginRequest } from './authApi.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'fp_token';
const USER_KEY = 'fp_user';
const STATION_KEY = 'fp_station';

function readStoredStation() {
  try {
    return localStorage.getItem(STATION_KEY) || 'all';
  } catch {
    return 'all';
  }
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    return raw && token ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [activeStationId, setActiveStationId] = useState(readStoredStation);
  const [stations, setStations] = useState([]);

  // Persist the active station so it survives reloads and the API client can
  // attach it (Station-Id header) to every request.
  useEffect(() => {
    try {
      localStorage.setItem(STATION_KEY, activeStationId);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [activeStationId]);

  // Keep the stored user in sync with memory (e.g. after a role switch).
  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [user]);

  // The stations this user may access — fetched from the backend (scoped to the
  // authenticated user by the token). Cleared on logout.
  useEffect(() => {
    if (!user) {
      setStations([]);
      return;
    }
    let cancelled = false;
    getStationsDropDown()
      .then((list) => {
        if (!cancelled) setStations(list.map((s) => ({ id: s.value, name: s.label, code: s.code })));
      })
      .catch(() => {
        if (!cancelled) setStations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const persistSession = useCallback((token, nextUser) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch {
      /* ignore */
    }
    setUser(nextUser);
    setActiveStationId('all');
  }, []);

  /**
   * Sign in. Tries the regular endpoint first; if that rejects (e.g. the
   * account is a Super Admin), falls back to the admin endpoint. Mirrors the
   * controller's validation client-side and surfaces blocking 403 messages.
   * @returns {Promise<{ ok: boolean, error?: string }>}
   */
  const login = useCallback(
    async (email, password) => {
      const mail = String(email || '').trim();
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(mail)) return { ok: false, error: 'Please enter a valid email address.' };
      if (!password || password.length < 5 || password.length > 50) {
        return { ok: false, error: 'Password must be between 5 and 50 characters.' };
      }

      // 1) Regular user login (Admin / Sales).
      try {
        const { token, user: u } = await loginRequest(mail, password);
        persistSession(token, u);
        return { ok: true };
      } catch (err) {
        if (err.status === 0) return { ok: false, error: 'Cannot reach the server. Check your connection.' };
        // A blocking business rule returns 403 *with* a token (deactivated /
        // subscription expired / awaiting admin approval) — don't try admin.
        if (err.status === 403 && err.data?.token) {
          return { ok: false, error: err.data.message || 'Your account cannot sign in right now.' };
        }
        // Otherwise it's likely a Super Admin (or bad creds) → try admin login.
      }

      // 2) Super Admin login.
      try {
        const { token, user: u } = await adminLoginRequest(mail, password);
        persistSession(token, u);
        return { ok: true };
      } catch (err) {
        if (err.status === 0) return { ok: false, error: 'Cannot reach the server. Check your connection.' };
        return { ok: false, error: err.data?.message || 'Invalid email or password.' };
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
    setActiveStationId('all');
  }, []);

  const can = useCallback((permission) => canDo(user, permission), [user]);
  const setRole = useCallback((role) => setUser((u) => (u ? { ...u, role } : u)), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      setUser,
      setRole,
      login,
      logout,
      can,
      stations,
      activeStationId,
      setActiveStationId
    }),
    [user, setRole, login, logout, can, stations, activeStationId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
