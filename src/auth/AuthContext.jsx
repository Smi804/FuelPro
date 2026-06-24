import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { can as canDo } from '../domain/permissions.js';
import { ROLES } from '../domain/roles.js';
import { STATIONS } from '../data/mock/stations.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'fp_token';
const USER_KEY = 'fp_user';

// Dummy accounts for the demo login. Swap this out for a real auth API later —
// `login()` is the only thing that needs to change.
const ACCOUNTS = [
  {
    email: 'admin@gmail.com',
    password: 'admin123',
    user: { id: 'u_1', name: 'Admin', email: 'admin@gmail.com', role: ROLES.SUPER_ADMIN, stationIds: [], avatarColor: 'var(--primary)' }
  },
  {
    email: 'owner@gmail.com',
    password: 'owner123',
    user: { id: 'u_2', name: 'Aigars Silkalns', email: 'owner@gmail.com', role: ROLES.BUSINESS_OWNER, stationIds: [], avatarColor: 'var(--primary)' }
  },
  {
    email: 'manager@gmail.com',
    password: 'manager123',
    user: { id: 'u_3', name: 'Sarah Kowalski', email: 'manager@gmail.com', role: ROLES.STATION_MANAGER, stationIds: ['st_1'], avatarColor: 'var(--primary)' }
  }
];

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
  const [activeStationId, setActiveStationId] = useState('all');

  // Keep storage in sync with the in-memory user (e.g. after a role switch).
  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [user]);

  // The stations this user may access (owners/super admins see all).
  const stations = useMemo(() => {
    if (!user || !user.stationIds?.length) return STATIONS;
    return STATIONS.filter((s) => user.stationIds.includes(s.id));
  }, [user]);

  const login = useCallback((email, password) => {
    const match = ACCOUNTS.find(
      (a) => a.email.toLowerCase() === String(email).trim().toLowerCase() && a.password === password
    );
    if (!match) return { ok: false, error: 'Invalid email or password.' };
    try {
      localStorage.setItem(TOKEN_KEY, `demo-${match.user.id}-${Date.now()}`);
      localStorage.setItem(USER_KEY, JSON.stringify(match.user));
    } catch {
      /* ignore */
    }
    setUser(match.user);
    setActiveStationId('all');
    return { ok: true };
  }, []);

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
