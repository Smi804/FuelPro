export const SHIFT_STATUS = {
  open: { label: 'Open', cls: 'status-green' },
  closed: { label: 'Closed', cls: 'status-blue' }
};

export const SHIFTS = [
  { id: 'sh_1', employeeId: 'e_8', employeeName: 'Yuki Tanaka', stationId: 'st_1', stationName: 'Riverside Fuel Center', openingCash: 200, closingCash: null, expenses: null, cashDifference: null, status: 'open', startedAt: '2026-06-23 08:00', endedAt: null },
  { id: 'sh_2', employeeId: 'e_7', employeeName: 'Diego Reyes', stationId: 'st_2', stationName: 'Highway 7 Station', openingCash: 250, closingCash: null, expenses: null, cashDifference: null, status: 'open', startedAt: '2026-06-23 07:30', endedAt: null },
  { id: 'sh_3', employeeId: 'e_9', employeeName: 'Tom Hardy', stationId: 'st_2', stationName: 'Highway 7 Station', openingCash: 200, closingCash: 1840, expenses: 60, cashDifference: -12, status: 'closed', notes: 'Short by 12 — recount tomorrow', startedAt: '2026-06-22 08:00', endedAt: '2026-06-22 16:00' },
  { id: 'sh_4', employeeId: 'e_8', employeeName: 'Yuki Tanaka', stationId: 'st_1', stationName: 'Riverside Fuel Center', openingCash: 200, closingCash: 2210, expenses: 40, cashDifference: 0, status: 'closed', notes: '', startedAt: '2026-06-22 08:00', endedAt: '2026-06-22 16:00' }
];

export const METER_READINGS = [
  { id: 'mr_1', stationId: 'st_1', pumpId: 'pm_1', pumpNumber: 'P-01', openingReading: 481620, closingReading: 482104, litresSold: 484, date: '2026-06-23' },
  { id: 'mr_2', stationId: 'st_1', pumpId: 'pm_2', pumpNumber: 'P-02', openingReading: 391500, closingReading: 391882, litresSold: 382, date: '2026-06-23' },
  { id: 'mr_3', stationId: 'st_2', pumpId: 'pm_5', pumpNumber: 'P-01', openingReading: 719400, closingReading: 720114, litresSold: 714, date: '2026-06-23' }
];

export const EXPENSE_CATEGORIES = ['Utilities', 'Maintenance', 'Salaries', 'Supplies', 'Transport', 'Marketing', 'Misc'];

export const EXPENSES = [
  { id: 'ex_1', category: 'Utilities', stationId: 'st_1', stationName: 'Riverside Fuel Center', amount: 1240, description: 'Electricity — June', date: '2026-06-20' },
  { id: 'ex_2', category: 'Maintenance', stationId: 'st_2', stationName: 'Highway 7 Station', amount: 680, description: 'Pump P-02 servicing', date: '2026-06-19' },
  { id: 'ex_3', category: 'Salaries', stationId: 'st_1', stationName: 'Riverside Fuel Center', amount: 8400, description: 'Staff payroll — first half', date: '2026-06-15' },
  { id: 'ex_4', category: 'Supplies', stationId: 'st_3', stationName: 'Old Town Petrol', amount: 320, description: 'Receipt rolls & cleaning', date: '2026-06-18' },
  { id: 'ex_5', category: 'Transport', stationId: 'st_2', stationName: 'Highway 7 Station', amount: 540, description: 'Stock transfer fuel', date: '2026-06-17' }
];
