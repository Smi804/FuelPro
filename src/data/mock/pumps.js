export const PUMP_STATUS = {
  active: { label: 'Active', cls: 'status-green' },
  idle: { label: 'Idle', cls: 'status-blue' },
  maintenance: { label: 'Maintenance', cls: 'status-yellow' },
  offline: { label: 'Offline', cls: 'status-red' }
};

export const PUMPS = [
  { id: 'pm_1', stationId: 'st_1', pumpNumber: 'P-01', fuelType: 'petrol', tankId: 'tk_1', tankName: 'Tank A1', currentReading: 482104, status: 'active' },
  { id: 'pm_2', stationId: 'st_1', pumpNumber: 'P-02', fuelType: 'petrol', tankId: 'tk_1', tankName: 'Tank A1', currentReading: 391882, status: 'active' },
  { id: 'pm_3', stationId: 'st_1', pumpNumber: 'P-03', fuelType: 'diesel', tankId: 'tk_2', tankName: 'Tank A2', currentReading: 612045, status: 'idle' },
  { id: 'pm_4', stationId: 'st_1', pumpNumber: 'P-04', fuelType: 'premium', tankId: 'tk_3', tankName: 'Tank A3', currentReading: 128300, status: 'maintenance' },
  { id: 'pm_5', stationId: 'st_2', pumpNumber: 'P-01', fuelType: 'petrol', tankId: 'tk_4', tankName: 'Tank B1', currentReading: 720114, status: 'active' },
  { id: 'pm_6', stationId: 'st_2', pumpNumber: 'P-02', fuelType: 'diesel', tankId: 'tk_5', tankName: 'Tank B2', currentReading: 559920, status: 'offline' },
  { id: 'pm_7', stationId: 'st_3', pumpNumber: 'P-01', fuelType: 'petrol', tankId: 'tk_6', tankName: 'Tank C1', currentReading: 204880, status: 'idle' }
];
