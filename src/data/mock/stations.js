export const STATIONS = [
  { id: 'st_1', organizationId: 'org_1', name: 'Riverside Fuel Center', address: '120 Riverside Dr', city: 'Riga', managerId: 'e_2', managerName: 'Sarah Kowalski', status: 'active', pumpCount: 8, tankCount: 4, employeeCount: 14, fuelStockPct: 72, createdAt: '2024-03-01' },
  { id: 'st_2', organizationId: 'org_1', name: 'Highway 7 Station', address: '7 North Expressway', city: 'Jurmala', managerId: 'e_3', managerName: 'Michael Reyes', status: 'active', pumpCount: 12, tankCount: 6, employeeCount: 22, fuelStockPct: 48, createdAt: '2024-05-14' },
  { id: 'st_3', organizationId: 'org_1', name: 'Old Town Petrol', address: '45 Vecpilseta St', city: 'Riga', managerId: 'e_4', managerName: 'Emily Wang', status: 'maintenance', pumpCount: 6, tankCount: 3, employeeCount: 9, fuelStockPct: 21, createdAt: '2024-07-22' },
  { id: 'st_4', organizationId: 'org_1', name: 'Seaside Express', address: '9 Coastal Hwy', city: 'Liepaja', managerId: 'e_5', managerName: 'Mark Kim', status: 'inactive', pumpCount: 4, tankCount: 2, employeeCount: 5, fuelStockPct: 5, createdAt: '2024-11-02' }
];

export const STATION_STATUS = {
  active: { label: 'Active', cls: 'status-green' },
  maintenance: { label: 'Maintenance', cls: 'status-yellow' },
  inactive: { label: 'Inactive', cls: 'status-red' }
};
