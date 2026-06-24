export const PAYMENT_STATUS = {
  paid: { label: 'Paid', cls: 'status-green' },
  pending: { label: 'Pending', cls: 'status-yellow' },
  partial: { label: 'Partial', cls: 'status-blue' },
  overdue: { label: 'Overdue', cls: 'status-red' }
};

export const PAYMENT_METHOD = {
  cash: 'Cash',
  card: 'Card',
  credit: 'Credit',
  wallet: 'Wallet'
};

export const SALES = [
  { id: 's_1', invoiceNumber: 'INV-10231', stationId: 'st_1', stationName: 'Riverside Fuel Center', productId: 'p_1', productName: 'Petrol 95', quantity: 42.5, unitPrice: 1.62, amount: 68.85, customerId: 'c_1', customerName: 'Walk-in', paymentMethod: 'cash', paymentStatus: 'paid', date: '2026-06-23 09:14' },
  { id: 's_2', invoiceNumber: 'INV-10232', stationId: 'st_1', stationName: 'Riverside Fuel Center', productId: 'p_3', productName: 'Diesel', quantity: 120, unitPrice: 1.55, amount: 186.0, customerId: 'c_2', customerName: 'Acme Logistics', paymentMethod: 'credit', paymentStatus: 'pending', date: '2026-06-23 09:40' },
  { id: 's_3', invoiceNumber: 'INV-10233', stationId: 'st_2', stationName: 'Highway 7 Station', productId: 'p_2', productName: 'Petrol 98', quantity: 35, unitPrice: 1.78, amount: 62.3, customerId: 'c_1', customerName: 'Walk-in', paymentMethod: 'card', paymentStatus: 'paid', date: '2026-06-23 10:02' },
  { id: 's_4', invoiceNumber: 'INV-10234', stationId: 'st_2', stationName: 'Highway 7 Station', productId: 'p_4', productName: 'Diesel Pro', quantity: 200, unitPrice: 1.69, amount: 338.0, customerId: 'c_3', customerName: 'Globex Transport', paymentMethod: 'credit', paymentStatus: 'partial', date: '2026-06-23 10:31' },
  { id: 's_5', invoiceNumber: 'INV-10235', stationId: 'st_1', stationName: 'Riverside Fuel Center', productId: 'p_1', productName: 'Petrol 95', quantity: 28, unitPrice: 1.62, amount: 45.36, customerId: 'c_1', customerName: 'Walk-in', paymentMethod: 'cash', paymentStatus: 'paid', date: '2026-06-23 11:05' },
  { id: 's_6', invoiceNumber: 'INV-10236', stationId: 'st_3', stationName: 'Old Town Petrol', productId: 'p_5', productName: 'CNG', quantity: 18, unitPrice: 1.12, amount: 20.16, customerId: 'c_4', customerName: 'City Taxi Co', paymentMethod: 'credit', paymentStatus: 'overdue', date: '2026-06-22 16:44' },
  { id: 's_7', invoiceNumber: 'INV-10237', stationId: 'st_2', stationName: 'Highway 7 Station', productId: 'p_3', productName: 'Diesel', quantity: 310, unitPrice: 1.55, amount: 480.5, customerId: 'c_2', customerName: 'Acme Logistics', paymentMethod: 'credit', paymentStatus: 'pending', date: '2026-06-22 15:10' },
  { id: 's_8', invoiceNumber: 'INV-10238', stationId: 'st_1', stationName: 'Riverside Fuel Center', productId: 'p_2', productName: 'Petrol 98', quantity: 50, unitPrice: 1.78, amount: 89.0, customerId: 'c_1', customerName: 'Walk-in', paymentMethod: 'card', paymentStatus: 'paid', date: '2026-06-22 14:22' },
  { id: 's_9', invoiceNumber: 'INV-10239', stationId: 'st_2', stationName: 'Highway 7 Station', productId: 'p_1', productName: 'Petrol 95', quantity: 64, unitPrice: 1.62, amount: 103.68, customerId: 'c_5', customerName: 'Rapid Couriers', paymentMethod: 'wallet', paymentStatus: 'paid', date: '2026-06-22 12:50' },
  { id: 's_10', invoiceNumber: 'INV-10240', stationId: 'st_1', stationName: 'Riverside Fuel Center', productId: 'p_3', productName: 'Diesel', quantity: 90, unitPrice: 1.55, amount: 139.5, customerId: 'c_3', customerName: 'Globex Transport', paymentMethod: 'credit', paymentStatus: 'pending', date: '2026-06-21 18:05' },
  { id: 's_11', invoiceNumber: 'INV-10241', stationId: 'st_2', stationName: 'Highway 7 Station', productId: 'p_4', productName: 'Diesel Pro', quantity: 150, unitPrice: 1.69, amount: 253.5, customerId: 'c_2', customerName: 'Acme Logistics', paymentMethod: 'credit', paymentStatus: 'paid', date: '2026-06-21 11:18' },
  { id: 's_12', invoiceNumber: 'INV-10242', stationId: 'st_1', stationName: 'Riverside Fuel Center', productId: 'p_1', productName: 'Petrol 95', quantity: 33, unitPrice: 1.62, amount: 53.46, customerId: 'c_1', customerName: 'Walk-in', paymentMethod: 'cash', paymentStatus: 'paid', date: '2026-06-21 09:02' }
];

// Small daily/monthly series for dashboard charts.
export const DAILY_SALES = [62, 75, 58, 81, 69, 92, 88, 74, 96, 85, 79, 101, 94, 110];
export const MONTHLY_REVENUE = [28, 34, 31, 42, 38, 55, 50, 66, 60, 75, 70, 82];
export const FUEL_CONSUMPTION = [40, 55, 48, 62, 58, 50, 66, 60, 72, 64, 78, 70];
export const PROFIT_TREND = [12, 18, 15, 24, 20, 30, 27, 36, 31, 40, 35, 46];
