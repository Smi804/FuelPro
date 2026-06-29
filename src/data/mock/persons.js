// DEMO / MOCK data for the station-scoped Persons directory (used while
// USE_MOCK is true in src/api/config.js). Shapes mirror the real API responses
// so the page doesn't change between mock and live mode.

export const MOCK_PERSON_TYPES = [
  { id: 1, type: 'Customer' },
  { id: 2, type: 'Supplier' },
  { id: 4, type: 'Employee' },
  { id: 5, type: 'Labor' },
  { id: 7, type: 'Vendor' }
];

export const MOCK_PERSONS = [
  {
    id: 1, user_id: 10, station_id: 1, name: 'Ali Traders', person_type: 2, father_name: 'Akram',
    phone_no: '03001234567', email: 'ali@example.com', cnic: '35201-1234567-1', address: 'Lahore',
    isActive: 1, ntn: '1234567-8', gst: 'GST-0099', dsl: null, date: '2026-06-01', opening_balance: 5000
  },
  {
    id: 2, user_id: 10, station_id: 1, name: 'City Transport Co', person_type: 1, father_name: '',
    phone_no: '03007778899', email: 'fleet@citytransport.com', cnic: '35201-7654321-9', address: 'Gulberg, Lahore',
    isActive: 1, ntn: null, gst: null, dsl: null, date: null, opening_balance: 12000
  },
  {
    id: 3, user_id: 10, station_id: 1, name: 'Bilal Khan', person_type: 4, father_name: 'Rashid Khan',
    phone_no: '03331122334', email: 'bilal@station.com', cnic: '35202-1112223-4', address: 'Model Town, Lahore',
    isActive: 1, ntn: null, gst: null, dsl: null, date: null, opening_balance: 0
  },
  {
    id: 4, user_id: 10, station_id: 2, name: 'NordFuel Supply', person_type: 2, father_name: '',
    phone_no: '04235551212', email: 'sales@nordfuel.com', cnic: '', address: 'Industrial Estate',
    isActive: 1, ntn: '7788990-1', gst: 'GST-2211', dsl: 'DSL-55', date: '2026-05-12', opening_balance: 0
  },
  {
    id: 5, user_id: 10, station_id: 2, name: 'Rapid Couriers', person_type: 1, father_name: '',
    phone_no: '04236667788', email: 'ops@rapid.com', cnic: '', address: 'Township',
    isActive: 0, ntn: null, gst: null, dsl: null, date: null, opening_balance: 0
  }
];
