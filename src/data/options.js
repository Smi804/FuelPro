// Shared select-option builders derived from mock data.
import { STATIONS } from './mock/stations.js';
import { PRODUCTS, FUEL_TYPE } from './mock/products.js';

export const stationOptions = STATIONS.map((s) => ({ value: s.name, label: s.name }));
export const stationIdOptions = STATIONS.map((s) => ({ value: s.id, label: s.name }));
export const productOptions = PRODUCTS.map((p) => ({ value: p.name, label: p.name }));
export const fuelTypeOptions = Object.entries(FUEL_TYPE).map(([value, m]) => ({ value, label: m.label }));
