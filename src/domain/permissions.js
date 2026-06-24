// Role-Based Access Control (RBAC).
//
// A permission is the string `${module}:${action}`. The PERMISSION_MATRIX maps
// each role to the modules it can touch and the actions it may perform there.
// `super_admin` is granted everything implicitly.

import { ROLES } from './roles.js';

export const ACTIONS = ['view', 'create', 'update', 'delete', 'export', 'approve'];

// All modules, grouped for the permission matrix UI.
export const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'stations', label: 'Stations' },
  { key: 'sales', label: 'Sales' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'meter_readings', label: 'Meter Readings' },
  { key: 'products', label: 'Fuel Products' },
  { key: 'tanks', label: 'Tanks' },
  { key: 'pumps', label: 'Pumps' },
  { key: 'stock_entries', label: 'Stock Entries' },
  { key: 'stock_transfers', label: 'Stock Transfers' },
  { key: 'customers', label: 'Customers' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'employees', label: 'Employees' },
  { key: 'shifts', label: 'Shift Management' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'accounting', label: 'Accounting' },
  { key: 'reports', label: 'Reports' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'users', label: 'Users' },
  { key: 'roles', label: 'Roles' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'settings', label: 'Settings' },
  { key: 'audit_logs', label: 'Audit Logs' },
  { key: 'atg', label: 'ATG Management' },
  { key: 'fuel_sales', label: 'Fuel Sales' },
  { key: 'fuel_pricing', label: 'Fuel Pricing' },
  { key: 'fuel_inventory', label: 'Fuel Inventory' },
  { key: 'purchase_invoices', label: 'Purchase Invoices' },
  { key: 'fuel_audits', label: 'Fuel Audits' },
  { key: 'fuel_audit_config', label: 'Fuel Audit Config' },
  { key: 'invoice_entry_service', label: 'Invoice Entry Service' }
];

const ALL = ['view', 'create', 'update', 'delete', 'export', 'approve'];
const READ = ['view'];
const READ_EXPORT = ['view', 'export'];
const CRUD = ['view', 'create', 'update', 'delete'];
const CRUD_EXPORT = ['view', 'create', 'update', 'delete', 'export'];

// module -> actions for each role (super_admin omitted; gets all).
export const PERMISSION_MATRIX = {
  [ROLES.BUSINESS_OWNER]: {
    dashboard: READ, stations: CRUD_EXPORT, sales: READ_EXPORT, invoices: READ_EXPORT,
    meter_readings: READ, products: CRUD_EXPORT, tanks: READ_EXPORT, pumps: READ_EXPORT,
    stock_entries: READ_EXPORT, stock_transfers: CRUD_EXPORT, customers: CRUD_EXPORT,
    suppliers: CRUD_EXPORT, employees: CRUD_EXPORT, shifts: READ_EXPORT, expenses: CRUD_EXPORT,
    accounting: READ_EXPORT, reports: READ_EXPORT, notifications: READ, users: CRUD_EXPORT,
    roles: READ, permissions: READ, settings: ['view', 'update'], audit_logs: READ_EXPORT,
    atg: CRUD_EXPORT, fuel_sales: READ_EXPORT, fuel_pricing: CRUD_EXPORT, fuel_inventory: CRUD_EXPORT,
    purchase_invoices: CRUD_EXPORT, fuel_audits: CRUD_EXPORT, fuel_audit_config: CRUD_EXPORT, invoice_entry_service: CRUD_EXPORT
  },
  [ROLES.STATION_MANAGER]: {
    dashboard: READ, stations: READ_EXPORT, sales: CRUD_EXPORT, invoices: CRUD_EXPORT,
    meter_readings: CRUD, products: READ, tanks: CRUD_EXPORT, pumps: CRUD_EXPORT,
    stock_entries: CRUD_EXPORT, stock_transfers: ['view', 'create', 'approve'], customers: CRUD_EXPORT,
    suppliers: READ_EXPORT, employees: CRUD_EXPORT, shifts: ['view', 'create', 'update', 'approve', 'export'],
    expenses: CRUD_EXPORT, accounting: READ, reports: READ_EXPORT, notifications: READ,
    settings: READ, audit_logs: READ,
    atg: ['view', 'update', 'export'], fuel_sales: READ_EXPORT, fuel_pricing: READ, fuel_inventory: CRUD_EXPORT,
    purchase_invoices: CRUD_EXPORT, fuel_audits: ['view', 'create', 'update', 'approve', 'export'],
    fuel_audit_config: READ, invoice_entry_service: READ
  },
  [ROLES.ACCOUNTANT]: {
    dashboard: READ, stations: READ, sales: READ_EXPORT, invoices: ['view', 'update', 'export', 'approve'],
    meter_readings: READ, products: READ, tanks: READ, pumps: READ, stock_entries: READ_EXPORT,
    stock_transfers: READ, customers: READ_EXPORT, suppliers: CRUD_EXPORT, employees: READ,
    shifts: READ_EXPORT, expenses: CRUD_EXPORT, accounting: CRUD_EXPORT, reports: READ_EXPORT,
    notifications: READ, settings: READ, audit_logs: READ_EXPORT,
    atg: READ, fuel_sales: READ_EXPORT, fuel_pricing: READ, fuel_inventory: READ,
    purchase_invoices: ['view', 'update', 'export', 'approve'], fuel_audits: READ_EXPORT,
    fuel_audit_config: READ, invoice_entry_service: READ
  },
  [ROLES.CASHIER]: {
    dashboard: READ, stations: READ, sales: ['view', 'create'], invoices: ['view', 'create'],
    meter_readings: READ, products: READ, customers: ['view', 'create'], shifts: ['view', 'create', 'update'],
    expenses: ['view', 'create'], notifications: READ,
    fuel_sales: ['view', 'create'], atg: READ
  },
  [ROLES.PUMP_ATTENDANT]: {
    dashboard: READ, stations: READ, meter_readings: ['view', 'create'], pumps: READ,
    sales: ['view', 'create'], shifts: ['view', 'create', 'update'], notifications: READ,
    fuel_sales: ['view', 'create'], atg: READ
  }
};

/**
 * Check whether a user/role may perform a permission ("module:action").
 * @param {{role?: string}|string} userOrRole
 * @param {string} permission e.g. "sales:create"
 */
export function can(userOrRole, permission) {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  if (!role) return false;
  if (role === ROLES.SUPER_ADMIN) return true;
  const [module, action = 'view'] = permission.split(':');
  const allowed = PERMISSION_MATRIX[role]?.[module];
  return Array.isArray(allowed) && allowed.includes(action);
}

/** All permission strings a role holds (for the permissions matrix view). */
export function permissionsForRole(role) {
  if (role === ROLES.SUPER_ADMIN) {
    return MODULES.flatMap((m) => ACTIONS.map((a) => `${m.key}:${a}`));
  }
  const map = PERMISSION_MATRIX[role] || {};
  return Object.entries(map).flatMap(([m, actions]) => actions.map((a) => `${m}:${a}`));
}
