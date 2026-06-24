import { ROLES } from '../../domain/roles.js';

export const CUSTOMERS = [
  { id: 'c_1', name: 'Walk-in', company: '—', phone: '—', creditLimit: 0, currentBalance: 0 },
  { id: 'c_2', name: 'Acme Logistics', company: 'Acme Corp', phone: '+371 2010 1122', creditLimit: 20000, currentBalance: 12480 },
  { id: 'c_3', name: 'Globex Transport', company: 'Globex Inc', phone: '+371 2033 4455', creditLimit: 15000, currentBalance: 9120 },
  { id: 'c_4', name: 'City Taxi Co', company: 'City Taxi', phone: '+371 2055 6677', creditLimit: 8000, currentBalance: 8460 },
  { id: 'c_5', name: 'Rapid Couriers', company: 'Rapid Ltd', phone: '+371 2077 8899', creditLimit: 5000, currentBalance: 0 }
];

export const SUPPLIERS = [
  { id: 'sup_1', name: 'BalticOil Wholesale', contactPerson: 'Janis Berzins', phone: '+371 6700 1100', address: 'Port Rd 12, Riga', outstandingBalance: 48200 },
  { id: 'sup_2', name: 'NordFuel Supply', contactPerson: 'Anna Liepa', phone: '+371 6700 2200', address: 'Industrial Ave 4, Ventspils', outstandingBalance: 0 },
  { id: 'sup_3', name: 'EuroGas Partners', contactPerson: 'Peteris Ozols', phone: '+371 6700 3300', address: 'Logistics Park 7, Jelgava', outstandingBalance: 15600 },
  { id: 'sup_4', name: 'PetroLink Distribution', contactPerson: 'Laura Kalnina', phone: '+371 6700 4400', address: 'Harbor St 21, Liepaja', outstandingBalance: 7300 }
];

export const EMPLOYEES = [
  { id: 'e_1', name: 'Aigars Silkalns', email: 'aigars@Fuel-Pro.io', phone: '+371 2900 0001', role: ROLES.BUSINESS_OWNER, stationId: 'st_1', stationName: 'Riverside Fuel Center', status: 'active' },
  { id: 'e_2', name: 'Sarah Kowalski', email: 'sarah@Fuel-Pro.io', phone: '+371 2900 0002', role: ROLES.STATION_MANAGER, stationId: 'st_1', stationName: 'Riverside Fuel Center', status: 'active' },
  { id: 'e_3', name: 'Michael Reyes', email: 'michael@Fuel-Pro.io', phone: '+371 2900 0003', role: ROLES.STATION_MANAGER, stationId: 'st_2', stationName: 'Highway 7 Station', status: 'active' },
  { id: 'e_4', name: 'Emily Wang', email: 'emily@Fuel-Pro.io', phone: '+371 2900 0004', role: ROLES.STATION_MANAGER, stationId: 'st_3', stationName: 'Old Town Petrol', status: 'on_leave' },
  { id: 'e_5', name: 'Mark Kim', email: 'mark@Fuel-Pro.io', phone: '+371 2900 0005', role: ROLES.STATION_MANAGER, stationId: 'st_4', stationName: 'Seaside Express', status: 'inactive' },
  { id: 'e_6', name: 'Lina Park', email: 'lina@Fuel-Pro.io', phone: '+371 2900 0006', role: ROLES.ACCOUNTANT, stationId: 'st_1', stationName: 'Riverside Fuel Center', status: 'active' },
  { id: 'e_7', name: 'Diego Reyes', email: 'diego@Fuel-Pro.io', phone: '+371 2900 0007', role: ROLES.CASHIER, stationId: 'st_2', stationName: 'Highway 7 Station', status: 'active' },
  { id: 'e_8', name: 'Yuki Tanaka', email: 'yuki@Fuel-Pro.io', phone: '+371 2900 0008', role: ROLES.PUMP_ATTENDANT, stationId: 'st_1', stationName: 'Riverside Fuel Center', status: 'active' },
  { id: 'e_9', name: 'Tom Hardy', email: 'tom@Fuel-Pro.io', phone: '+371 2900 0009', role: ROLES.PUMP_ATTENDANT, stationId: 'st_2', stationName: 'Highway 7 Station', status: 'active' }
];

export const EMPLOYEE_STATUS = {
  active: { label: 'Active', cls: 'status-green' },
  on_leave: { label: 'On leave', cls: 'status-yellow' },
  inactive: { label: 'Inactive', cls: 'status-red' }
};
