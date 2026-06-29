// Auth API — talks to the backend login endpoints through the shared API
// client (so the base URL lives in one place, see src/api/config.js).
//
//   POST login        → regular users (Admin / Sales). Super Admins rejected.
//   POST admin/login  → Super Admin only.
import { api } from '../api/client.js';
import { USE_MOCK } from '../api/config.js';
import { ROLES } from '../domain/roles.js';

// ── DEMO / MOCK login (active while USE_MOCK is true in src/api/config.js) ──
// Dummy credentials so the app works without the backend. Re-enable real auth
// by setting USE_MOCK = false.
const DUMMY_USERS = [
  { email: 'admin@gmail.com', password: 'admin123', role: 'Admin', name: 'Demo Owner', id: 10 },
  { email: 'sales@gmail.com', password: 'sales123', role: 'Sales', name: 'Demo Cashier', id: 11 }
];
const DUMMY_ADMIN = { email: 'superadmin@gmail.com', password: 'admin123', role: 'Super Admin', name: 'Super Admin', id: 1 };

const mockToken = () => `mock_token_${Date.now()}`;
function rejectAuth(message, status = 401) {
  const err = new Error(message);
  err.status = status;
  err.data = { status: 'error', message };
  return err;
}

// Backend role label → app RBAC role key (drives navigation + permissions).
const ROLE_MAP = {
  'Super Admin': ROLES.SUPER_ADMIN,
  Admin: ROLES.BUSINESS_OWNER,
  Sales: ROLES.CASHIER
};

export const mapBackendRole = (role) => ROLE_MAP[role] || ROLES.CASHIER;

// Normalize the various backend user shapes into the app's user object.
function buildUser(raw = {}, fallbackEmail) {
  return {
    id: raw.id,
    name: raw.name || fallbackEmail || 'User',
    email: raw.email || fallbackEmail || '',
    role: mapBackendRole(raw.role),
    backendRole: raw.role || null,
    stationIds: [], // backend doesn't scope by station yet ⇒ all stations
    packageName: raw.package_name ?? null,
    packageFeatures: raw.package_features ?? null,
    trialLogin: raw.trial_login ?? null,
    avatarColor: 'var(--primary)'
  };
}

function ensureOk(data) {
  if (data?.status !== 'ok' || !data.token) {
    const err = new Error(data?.message || 'Login failed.');
    err.status = 200;
    err.data = data;
    throw err;
  }
}

/** Regular user login (Admin / Sales). User payload is under `role`. */
export async function loginRequest(email, password) {
  if (USE_MOCK) {
    const u = DUMMY_USERS.find((x) => x.email === email && x.password === password);
    if (!u) throw rejectAuth('Invalid login credentials');
    return { token: mockToken(), user: buildUser({ id: u.id, name: u.name, email: u.email, role: u.role, package_name: 'Basic' }, email) };
  }
  const data = await api.post('login', { email, password });
  ensureOk(data);
  return { token: data.token, user: buildUser(data.role || {}, email) };
}

/** Super Admin login. User payload is under `user`. */
export async function adminLoginRequest(email, password) {
  if (USE_MOCK) {
    if (email === DUMMY_ADMIN.email && password === DUMMY_ADMIN.password) {
      return { token: mockToken(), user: buildUser({ id: DUMMY_ADMIN.id, name: DUMMY_ADMIN.name, email, role: DUMMY_ADMIN.role }, email) };
    }
    throw rejectAuth('Invalid email or password.');
  }
  const data = await api.post('login', { email, password });
  ensureOk(data);
  return { token: data.token, user: buildUser(data.user || {}, email) };
}
