export const TANK_STATUS = {
  ok: { label: 'OK', cls: 'status-green' },
  low: { label: 'Low', cls: 'status-yellow' },
  critical: { label: 'Critical', cls: 'status-red' }
};

function statusFor(stock, capacity, threshold) {
  if (stock <= threshold) return 'critical';
  if (stock <= threshold * 2) return 'low';
  return 'ok';
}

const raw = [
  { id: 'tk_1', stationId: 'st_1', name: 'Tank A1', fuelType: 'petrol', capacity: 30000, currentStock: 21600, lowStockThreshold: 5000 },
  { id: 'tk_2', stationId: 'st_1', name: 'Tank A2', fuelType: 'diesel', capacity: 30000, currentStock: 9200, lowStockThreshold: 5000 },
  { id: 'tk_3', stationId: 'st_1', name: 'Tank A3', fuelType: 'premium', capacity: 20000, currentStock: 14800, lowStockThreshold: 4000 },
  { id: 'tk_4', stationId: 'st_2', name: 'Tank B1', fuelType: 'petrol', capacity: 40000, currentStock: 12000, lowStockThreshold: 6000 },
  { id: 'tk_5', stationId: 'st_2', name: 'Tank B2', fuelType: 'diesel', capacity: 40000, currentStock: 4500, lowStockThreshold: 6000 },
  { id: 'tk_6', stationId: 'st_3', name: 'Tank C1', fuelType: 'petrol', capacity: 25000, currentStock: 3100, lowStockThreshold: 4000 },
  { id: 'tk_7', stationId: 'st_3', name: 'Tank C2', fuelType: 'cng', capacity: 15000, currentStock: 9800, lowStockThreshold: 2500 }
];

export const TANKS = raw.map((t) => ({ ...t, status: statusFor(t.currentStock, t.capacity, t.lowStockThreshold) }));
