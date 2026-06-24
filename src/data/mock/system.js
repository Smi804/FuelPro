import { ROLES } from '../../domain/roles.js';

export const USERS = [
  { id: 'u_1', name: 'Aigars Silkalns', email: 'aigars@Fuel-Pro.io', role: ROLES.BUSINESS_OWNER, stationIds: [], status: 'active', avatarColor: 'var(--primary)', lastActive: 'just now', joined: 'Mar 2024' },
  { id: 'u_2', name: 'Sarah Kowalski', email: 'sarah@Fuel-Pro.io', role: ROLES.STATION_MANAGER, stationIds: ['st_1'], status: 'active', avatarColor: 'var(--azure)', lastActive: '4 min ago', joined: 'Apr 2024' },
  { id: 'u_3', name: 'Michael Reyes', email: 'michael@Fuel-Pro.io', role: ROLES.STATION_MANAGER, stationIds: ['st_2'], status: 'active', avatarColor: 'var(--purple)', lastActive: '1 hour ago', joined: 'May 2024' },
  { id: 'u_4', name: 'Lina Park', email: 'lina@Fuel-Pro.io', role: ROLES.ACCOUNTANT, stationIds: ['st_1', 'st_2'], status: 'active', avatarColor: 'var(--green)', lastActive: 'Yesterday', joined: 'Jun 2024' },
  { id: 'u_5', name: 'Diego Reyes', email: 'diego@Fuel-Pro.io', role: ROLES.CASHIER, stationIds: ['st_2'], status: 'active', avatarColor: 'var(--blue)', lastActive: '2 days ago', joined: 'Sep 2024' },
  { id: 'u_6', name: 'Yuki Tanaka', email: 'yuki@Fuel-Pro.io', role: ROLES.PUMP_ATTENDANT, stationIds: ['st_1'], status: 'active', avatarColor: 'var(--yellow)', lastActive: '3 hours ago', joined: 'Oct 2024' },
  { id: 'u_7', name: 'newhire@Fuel-Pro.io', email: 'newhire@Fuel-Pro.io', role: ROLES.CASHIER, stationIds: ['st_3'], status: 'invited', avatarColor: 'var(--text-disabled)', lastActive: '—', joined: 'Jun 2026' },
  { id: 'u_8', name: 'Robert Jones', email: 'robert@Fuel-Pro.io', role: ROLES.PUMP_ATTENDANT, stationIds: ['st_4'], status: 'suspended', avatarColor: 'var(--red)', lastActive: '2 weeks ago', joined: 'Dec 2024' }
];

export const USER_STATUS = {
  active: { label: 'Active', cls: 'status-green' },
  invited: { label: 'Invited', cls: 'status-yellow' },
  suspended: { label: 'Suspended', cls: 'status-red' }
};

export const AUDIT_LOGS = [
  { id: 'al_1', user: 'Sarah Kowalski', action: 'update', module: 'pumps', previousValue: 'P-04: active', newValue: 'P-04: maintenance', timestamp: '2026-06-23 11:42', ipAddress: '10.0.4.12' },
  { id: 'al_2', user: 'Diego Reyes', action: 'create', module: 'sales', previousValue: '—', newValue: 'INV-10234 · $338.00', timestamp: '2026-06-23 10:31', ipAddress: '10.0.7.4' },
  { id: 'al_3', user: 'Lina Park', action: 'approve', module: 'invoices', previousValue: 'INV-10232: pending', newValue: 'INV-10232: approved', timestamp: '2026-06-23 09:58', ipAddress: '10.0.1.8' },
  { id: 'al_4', user: 'Aigars Silkalns', action: 'update', module: 'settings', previousValue: 'Currency: USD', newValue: 'Currency: EUR', timestamp: '2026-06-22 18:20', ipAddress: '10.0.0.2' },
  { id: 'al_5', user: 'Michael Reyes', action: 'delete', module: 'stock_transfers', previousValue: 'TR-draft-19', newValue: '—', timestamp: '2026-06-22 14:05', ipAddress: '10.0.7.1' },
  { id: 'al_6', user: 'Yuki Tanaka', action: 'create', module: 'meter_readings', previousValue: '—', newValue: 'P-01: 484 L', timestamp: '2026-06-23 08:05', ipAddress: '10.0.4.20' }
];

export const NOTIFICATIONS = [
  { id: 'n_1', kind: 'alert', title: 'Low stock', body: 'Tank C1 (Old Town Petrol) is below threshold — 3,100 L left.', time: '8 min ago', unread: true },
  { id: 'n_2', kind: 'info', title: 'Stock delivered', body: 'PO-5521 received at Riverside — 12,000 L Petrol 95.', time: '1 hour ago', unread: true },
  { id: 'n_3', kind: 'task', title: 'Shift to approve', body: "Tom Hardy's shift at Highway 7 is short by $12.", time: '2 hours ago', unread: true },
  { id: 'n_4', kind: 'alert', title: 'Overdue invoice', body: 'INV-10236 (City Taxi Co) is overdue by 1 day.', time: 'Yesterday', unread: false },
  { id: 'n_5', kind: 'info', title: 'New user invited', body: 'newhire@Fuel-Pro.io was invited as Cashier.', time: 'Yesterday', unread: false },
  { id: 'n_6', kind: 'mention', title: 'Mentioned in a note', body: 'Sarah mentioned you in the Old Town maintenance log.', time: '2 days ago', unread: false }
];
