// DEMO / MOCK data for the station-scoped catalog (used while USE_MOCK is true
// in src/api/config.js). Shapes mirror the real API responses so pages don't
// change between mock and live mode.

export const MOCK_STATIONS = [
  {
    id: 1, user_id: 10, name: 'Main Street Station', code: 'STN-0001', brand: 'Shell', status: 'active',
    address: '123 Main Street', city: 'Austin', state: 'TX', zip_code: '73301', country: 'USA',
    latitude: 30.2672, longitude: -97.7431, timezone: 'America/Chicago', phone: '+1-512-555-0100',
    email: 'main@station.com', manager_name: 'John Doe', is_24_hours: true, shift_based_operation: true,
    auto_close_shift: false, fuel_unit: 'gallons', default_tax_rate: 8.25, low_fuel_threshold_percent: 15,
    inventory_method: 'FIFO', epa_enabled: true, last_inspection_date: '2026-05-01'
  },
  {
    id: 2, user_id: 10, name: 'Downtown Station', code: 'STN-0002', brand: 'BP', status: 'active',
    address: '9 Market Ave', city: 'Dallas', state: 'TX', zip_code: '75201', country: 'USA',
    latitude: 32.7767, longitude: -96.797, timezone: 'America/Chicago', phone: '+1-214-555-0144',
    email: 'downtown@station.com', manager_name: 'Sarah Kowalski', is_24_hours: false, shift_based_operation: true,
    auto_close_shift: true, fuel_unit: 'gallons', default_tax_rate: 8.25, low_fuel_threshold_percent: 20,
    inventory_method: 'AVERAGE', epa_enabled: false, last_inspection_date: '2026-04-12'
  },
  {
    id: 3, user_id: 10, name: 'Seaside Express', code: 'STN-0003', brand: 'Chevron', status: 'inactive',
    address: '9 Coastal Hwy', city: 'Corpus Christi', state: 'TX', zip_code: '78401', country: 'USA',
    latitude: 27.8006, longitude: -97.3964, timezone: 'America/Chicago', phone: '+1-361-555-0199',
    email: 'seaside@station.com', manager_name: 'Mark Kim', is_24_hours: false, shift_based_operation: false,
    auto_close_shift: false, fuel_unit: 'gallons', default_tax_rate: 6.25, low_fuel_threshold_percent: 25,
    inventory_method: 'FIFO', epa_enabled: true, last_inspection_date: '2026-03-20'
  }
];

export const MOCK_BRANDS = [
  { id: 1, user_id: 10, station_id: 1, name: 'Shell', status: 1, description: 'Shell lubricants & fuel', image_url: '' },
  { id: 2, user_id: 10, station_id: 1, name: 'Mobil', status: 1, description: 'Mobil engine oils', image_url: '' },
  { id: 3, user_id: 10, station_id: 1, name: 'Castrol', status: 0, description: 'Castrol lubricants', image_url: '' },
  { id: 4, user_id: 10, station_id: 2, name: 'BP', status: 1, description: 'BP fuels', image_url: '' }
];

export const MOCK_ITEMS = [
  {
    id: 11, user_id: 10, station_id: 1, category_id: 3, brand_id: 1, name: 'Diesel', type: 'FUEL', sku: null,
    barcode: null, status: 1, description: 'Euro 5 high-speed diesel', image_url: '',
    category: { id: 3, name: 'Fuel' }, station: { id: 1, name: 'Main Street Station', code: 'STN-0001' }
  },
  {
    id: 12, user_id: 10, station_id: 1, category_id: 3, brand_id: 1, name: 'Premium Petrol', type: 'FUEL', sku: null,
    barcode: null, status: 1, description: '95 octane', image_url: '',
    category: { id: 3, name: 'Fuel' }, station: { id: 1, name: 'Main Street Station', code: 'STN-0001' }
  },
  {
    id: 13, user_id: 10, station_id: 1, category_id: 5, brand_id: 2, name: 'Engine Oil 1L', type: 'RETAIL', sku: 'EO-1L-001',
    barcode: '8964000112233', status: 1, description: 'Mobil 1 litre', image_url: '',
    category: { id: 5, name: 'Lubricants' }, station: { id: 1, name: 'Main Street Station', code: 'STN-0001' }
  },
  {
    id: 14, user_id: 10, station_id: 2, category_id: 5, brand_id: 4, name: 'Coolant 2L', type: 'RETAIL', sku: 'CL-2L-009',
    barcode: '8964000119988', status: 0, description: 'Long-life coolant', image_url: '',
    category: { id: 5, name: 'Lubricants' }, station: { id: 2, name: 'Downtown Station', code: 'STN-0002' }
  }
];
