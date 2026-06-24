// Roles for the fuel station management system. Keep keys in sync with the
// `Role` union in domain/types.ts.

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  BUSINESS_OWNER: 'business_owner',
  STATION_MANAGER: 'station_manager',
  ACCOUNTANT: 'accountant',
  CASHIER: 'cashier',
  PUMP_ATTENDANT: 'pump_attendant'
};

export const ROLE_LIST = [
  { key: ROLES.SUPER_ADMIN, label: 'Super Admin', description: 'Full platform access across every organization.' },
  { key: ROLES.BUSINESS_OWNER, label: 'Business Owner', description: 'Owns the organization and all of its stations.' },
  { key: ROLES.STATION_MANAGER, label: 'Station Manager', description: 'Runs day-to-day operations for assigned stations.' },
  { key: ROLES.ACCOUNTANT, label: 'Accountant', description: 'Manages finance, accounting and reports.' },
  { key: ROLES.CASHIER, label: 'Cashier', description: 'Handles sales, invoices and shift cash.' },
  { key: ROLES.PUMP_ATTENDANT, label: 'Pump Attendant', description: 'Records meter readings and pump sales.' }
];

export const ROLE_LABEL = ROLE_LIST.reduce((acc, r) => {
  acc[r.key] = r.label;
  return acc;
}, {});

export const ROLE_BADGE_CLS = {
  [ROLES.SUPER_ADMIN]: 'role-purple',
  [ROLES.BUSINESS_OWNER]: 'role-red',
  [ROLES.STATION_MANAGER]: 'role-blue',
  [ROLES.ACCOUNTANT]: 'role-green',
  [ROLES.CASHIER]: 'role-blue',
  [ROLES.PUMP_ATTENDANT]: 'role-green'
};
