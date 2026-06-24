export const FUEL_TYPE = {
  petrol: { label: 'Petrol', cls: 'chip-primary' },
  diesel: { label: 'Diesel', cls: 'chip-yellow' },
  premium: { label: 'Premium', cls: 'chip-purple' },
  cng: { label: 'CNG', cls: 'chip-blue' },
  lpg: { label: 'LPG', cls: 'chip-green' }
};

export const PRODUCTS = [
  { id: 'p_1', name: 'Petrol 95', fuelType: 'petrol', unit: 'L', sellPrice: 1.62, costPrice: 1.34, taxPct: 21, active: true },
  { id: 'p_2', name: 'Petrol 98', fuelType: 'premium', unit: 'L', sellPrice: 1.78, costPrice: 1.46, taxPct: 21, active: true },
  { id: 'p_3', name: 'Diesel', fuelType: 'diesel', unit: 'L', sellPrice: 1.55, costPrice: 1.28, taxPct: 21, active: true },
  { id: 'p_4', name: 'Diesel Pro', fuelType: 'diesel', unit: 'L', sellPrice: 1.69, costPrice: 1.4, taxPct: 21, active: true },
  { id: 'p_5', name: 'CNG', fuelType: 'cng', unit: 'kg', sellPrice: 1.12, costPrice: 0.88, taxPct: 21, active: true },
  { id: 'p_6', name: 'LPG Autogas', fuelType: 'lpg', unit: 'L', sellPrice: 0.84, costPrice: 0.61, taxPct: 21, active: false }
];
