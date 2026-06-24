// ─────────────────────────────────────────────────────────────────────────
//  Fuel-supply demo data (US grades + suppliers). Powers the main dashboard,
//  the station overview, and the fuel-audit comparisons. Numbers are illustra-
//  tive; per-station amounts and the all-station totals are derived so the
//  figures stay internally consistent.
// ─────────────────────────────────────────────────────────────────────────

// Fuel grades and the colors used across charts/chips.
export const GRADES = [
  { key: 'regular', label: 'Regular', octane: '87', color: 'var(--blue)', chip: 'chip-blue' },
  { key: 'plus', label: 'Plus / Super', octane: '89', color: 'var(--green)', chip: 'chip-green' },
  { key: 'premium', label: 'Premium', octane: '91', color: 'var(--purple)', chip: 'chip-purple' },
  { key: 'diesel', label: 'Diesel', octane: '#2', color: 'var(--yellow)', chip: 'chip-yellow' }
];

export const GRADE_LABEL = Object.fromEntries(GRADES.map((g) => [g.key, g.label]));

// Current per-gallon quotes ($) by supplier and grade, plus which stations each
// supplier serves and the day-over-day change in their regular grade.
export const SUPPLIERS = [
  { id: 'synergy', name: 'Synergy', change: 0.03, stations: ['Los Gatos', 'Mountain View', 'Gilroy'], prices: { regular: 3.45, plus: 3.79, premium: 4.05, diesel: 4.25 } },
  { id: 'valero', name: 'Valero', change: -0.02, stations: ['Sunnyvale', 'Campbell'], prices: { regular: 3.39, plus: 3.72, premium: 3.99, diesel: 4.18 } },
  { id: 'chevron', name: 'Chevron', change: 0.01, stations: ['Santa Clara'], prices: { regular: 3.52, plus: 3.85, premium: 4.12, diesel: 4.31 } },
  { id: 'phillips66', name: 'Phillips 66', change: 0.0, stations: ['Saratoga'], prices: { regular: 3.48, plus: 3.8, premium: 4.08, diesel: 4.22 } }
];

const SUPPLIER_BY_NAME = Object.fromEntries(SUPPLIERS.map((s) => [s.name, s]));

// Market day-quote per grade ($/gal) — the reference used to audit invoices.
export const TODAY_QUOTES = { regular: 3.45, plus: 3.79, premium: 4.05, diesel: 4.25 };

// Average daily quote per grade over the last 7 days (for the price trend).
export const WEEKLY_PRICES = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  regular: [3.4, 3.42, 3.41, 3.44, 3.45, 3.46, 3.45],
  plus: [3.74, 3.75, 3.76, 3.78, 3.79, 3.8, 3.79],
  premium: [4.0, 4.01, 4.02, 4.04, 4.05, 4.06, 4.05],
  diesel: [4.18, 4.2, 4.21, 4.23, 4.24, 4.26, 4.25]
};

// Per-supplier weekly price series ($/gal) by grade. Each supplier follows the
// market's day-to-day shape but is anchored to its own current price (the last
// day equals SUPPLIERS[].prices), so the trends stay internally consistent.
export const SUPPLIER_WEEKLY = Object.fromEntries(
  SUPPLIERS.map((sup) => [
    sup.id,
    GRADES.reduce((acc, g) => {
      const market = WEEKLY_PRICES[g.key];
      const lastMarket = market[market.length - 1];
      acc[g.key] = market.map((v) => +(sup.prices[g.key] + (v - lastMarket)).toFixed(2));
      return acc;
    }, {})
  ])
);

// Weekly series for a supplier id, or the market average when omitted/unknown.
export const getWeeklyPrices = (supplierId) =>
  (supplierId && SUPPLIER_WEEKLY[supplierId]) || {
    regular: WEEKLY_PRICES.regular,
    plus: WEEKLY_PRICES.plus,
    premium: WEEKLY_PRICES.premium,
    diesel: WEEKLY_PRICES.diesel
  };

// Per-station gallons purchased up to date, by grade. Supplier sets the price.
const STATION_GALLONS = [
  { id: 'los-gatos', name: 'Los Gatos', supplier: 'Synergy', gallons: { regular: 320000, plus: 90000, premium: 60000, diesel: 210000 } },
  { id: 'mountain-view', name: 'Mountain View', supplier: 'Synergy', gallons: { regular: 280000, plus: 80000, premium: 52000, diesel: 190000 } },
  { id: 'gilroy', name: 'Gilroy', supplier: 'Synergy', gallons: { regular: 210000, plus: 60000, premium: 40000, diesel: 160000 } },
  { id: 'sunnyvale', name: 'Sunnyvale', supplier: 'Valero', gallons: { regular: 150000, plus: 45000, premium: 34000, diesel: 120000 } },
  { id: 'campbell', name: 'Campbell', supplier: 'Valero', gallons: { regular: 120000, plus: 40000, premium: 30000, diesel: 95000 } },
  { id: 'santa-clara', name: 'Santa Clara', supplier: 'Chevron', gallons: { regular: 100000, plus: 55000, premium: 40000, diesel: 80000 } },
  { id: 'saratoga', name: 'Saratoga', supplier: 'Phillips 66', gallons: { regular: 60000, plus: 40000, premium: 30000, diesel: 50000 } }
];

const gallonsTotal = (g) => GRADES.reduce((s, gr) => s + (g[gr.key] || 0), 0);
const amountFor = (gallons, prices) => GRADES.reduce((s, gr) => s + (gallons[gr.key] || 0) * prices[gr.key], 0);

// Per-station rollups: today's price (from its supplier), gallons + amount to date.
export const SUPPLY_STATIONS = STATION_GALLONS.map((st) => {
  const prices = SUPPLIER_BY_NAME[st.supplier].prices;
  return {
    ...st,
    today: prices,
    totalGallons: gallonsTotal(st.gallons),
    amountPaid: amountFor(st.gallons, prices)
  };
});

// All-station totals up to date.
export const GALLONS_BY_GRADE = GRADES.reduce((acc, g) => {
  acc[g.key] = SUPPLY_STATIONS.reduce((s, st) => s + st.gallons[g.key], 0);
  return acc;
}, {});

export const TOTAL_GALLONS = Object.values(GALLONS_BY_GRADE).reduce((s, n) => s + n, 0);
export const TOTAL_AMOUNT_PAID = SUPPLY_STATIONS.reduce((s, st) => s + st.amountPaid, 0);

// Supply rollup keyed by catalog station id (used by the station-detail page,
// whose stations come from the catalog mock). Falls back to the first entry.
export const STATION_SUPPLY = {
  1: SUPPLY_STATIONS[0],
  2: SUPPLY_STATIONS[3],
  3: SUPPLY_STATIONS[5]
};

export const getStationSupply = (id) => STATION_SUPPLY[id] || SUPPLY_STATIONS[0];

// Donut segments for gallons-by-grade (shared by dashboard + station overview).
export const gallonsDonut = (byGrade) => {
  const total = GRADES.reduce((s, g) => s + (byGrade[g.key] || 0), 0) || 1;
  return GRADES.map((g) => ({ label: g.label, color: g.color, value: byGrade[g.key] || 0, pct: ((byGrade[g.key] || 0) / total) * 100 }));
};

export const usd = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
export const gal = (n) => `${Number(n).toLocaleString('en-US')} gal`;
