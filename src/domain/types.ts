/**
 * Domain types & database entity models for the Multi-Tenant Fuel Station
 * Management System.
 *
 * These TypeScript interfaces document the data contracts used across the app
 * and serve as the reference entity models for the backend. The runtime app is
 * authored in JSX and consumes these shapes via the mock data in `src/data/mock`.
 */

/* ------------------------------------------------------------------ */
/* Identity & RBAC                                                     */
/* ------------------------------------------------------------------ */

export type Role =
  | 'super_admin'
  | 'business_owner'
  | 'station_manager'
  | 'accountant'
  | 'cashier'
  | 'pump_attendant';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'approve';

export type ModuleKey =
  | 'dashboard'
  | 'stations'
  | 'sales'
  | 'invoices'
  | 'meter_readings'
  | 'products'
  | 'tanks'
  | 'pumps'
  | 'stock_entries'
  | 'stock_transfers'
  | 'customers'
  | 'suppliers'
  | 'employees'
  | 'shifts'
  | 'expenses'
  | 'accounting'
  | 'reports'
  | 'notifications'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'settings'
  | 'audit_logs'
  | 'atg'
  | 'fuel_sales'
  | 'fuel_pricing'
  | 'fuel_inventory'
  | 'purchase_invoices'
  | 'fuel_audits'
  | 'fuel_audit_config'
  | 'invoice_entry_service';

/** Permission string: `${ModuleKey}:${PermissionAction}` e.g. "sales:create". */
export type Permission = `${ModuleKey}:${PermissionAction}`;

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  /** Stations this user can access. Empty / undefined ⇒ all (owner/super admin). */
  stationIds: string[];
  status: 'active' | 'invited' | 'suspended';
  avatarColor?: string;
  lastActive?: string;
  joined?: string;
}

export interface RoleDefinition {
  key: Role;
  label: string;
  description: string;
  permissions: Permission[];
}

/* ------------------------------------------------------------------ */
/* Stations & assets                                                   */
/* ------------------------------------------------------------------ */

export type StationStatus = 'active' | 'maintenance' | 'inactive';

export interface Station {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  managerId: string;
  managerName: string;
  status: StationStatus;
  pumpCount: number;
  tankCount: number;
  employeeCount: number;
  fuelStockPct: number;
  createdAt: string;
}

export type FuelType = 'petrol' | 'diesel' | 'premium' | 'cng' | 'lpg';

export interface FuelProduct {
  id: string;
  name: string;
  fuelType: FuelType;
  unit: 'L' | 'kg';
  sellPrice: number;
  costPrice: number;
  taxPct: number;
  active: boolean;
}

export type TankStatus = 'ok' | 'low' | 'critical';

export interface Tank {
  id: string;
  stationId: string;
  name: string;
  fuelType: FuelType;
  capacity: number;
  currentStock: number;
  lowStockThreshold: number;
  status: TankStatus;
}

export type PumpStatus = 'active' | 'idle' | 'maintenance' | 'offline';

export interface Pump {
  id: string;
  stationId: string;
  pumpNumber: string;
  fuelType: FuelType;
  tankId: string;
  tankName: string;
  currentReading: number;
  status: PumpStatus;
}

/* ------------------------------------------------------------------ */
/* Inventory movements                                                 */
/* ------------------------------------------------------------------ */

export interface StockEntry {
  id: string;
  stationId: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  invoiceNumber: string;
  date: string;
}

export interface StockTransfer {
  id: string;
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  toStationName: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed';
  notes?: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/* Sales                                                               */
/* ------------------------------------------------------------------ */

export type PaymentMethod = 'cash' | 'card' | 'credit' | 'wallet';
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'overdue';

export interface Sale {
  id: string;
  invoiceNumber: string;
  stationId: string;
  stationName: string;
  pumpId?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  customerId?: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  date: string;
}

export interface MeterReading {
  id: string;
  stationId: string;
  pumpId: string;
  pumpNumber: string;
  openingReading: number;
  closingReading: number;
  /** Derived: closingReading - openingReading. */
  litresSold: number;
  date: string;
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export interface Customer {
  id: string;
  name: string;
  company?: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  outstandingBalance: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  stationId: string;
  stationName: string;
  status: 'active' | 'on_leave' | 'inactive';
}

/* ------------------------------------------------------------------ */
/* Shifts                                                              */
/* ------------------------------------------------------------------ */

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  stationId: string;
  stationName: string;
  openingCash: number;
  closingCash?: number;
  expenses?: number;
  cashDifference?: number;
  status: 'open' | 'closed';
  notes?: string;
  startedAt: string;
  endedAt?: string;
}

/* ------------------------------------------------------------------ */
/* Finance                                                             */
/* ------------------------------------------------------------------ */

export interface Expense {
  id: string;
  category: string;
  stationId: string;
  stationName: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  date: string;
}

export interface Transaction {
  id: string;
  date: string;
  account: string;
  description: string;
  type: 'debit' | 'credit';
  amount: number;
  reference: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  narration: string;
  lines: { account: string; debit: number; credit: number }[];
}

/* ------------------------------------------------------------------ */
/* System                                                              */
/* ------------------------------------------------------------------ */

export interface AuditLog {
  id: string;
  user: string;
  action: PermissionAction | string;
  module: ModuleKey | string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  kind: 'info' | 'alert' | 'task' | 'mention';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}
