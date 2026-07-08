import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay } from './mock-utils.js';

function assertOk(res) {
  if (res && res.status === 'error') {
    const err = new Error(res.message || 'Request failed.');
    err.data = res;
    throw err;
  }
  return res;
}

const EMPTY_DASHBOARD = {
  summary: {
    station_scope: 0,
    total_invoice_amount: 0,
    total_quantity_purchased: 0,
    total_suppliers: 0,
    total_stations_active: 0,
    total_quotations: 0
  },
  suppliers_prices_today: [],
  weekly_price_trends: [],
  supplier_price_comparison: []
};

function num(v) {
  return Number(v) || 0;
}

function mapSummary(s = {}) {
  return {
    station_scope: num(s.station_scope),
    total_invoice_amount: num(s.total_invoice_amount),
    total_quantity_purchased: num(s.total_quantity_purchased),
    total_suppliers: num(s.total_suppliers),
    total_stations_active: num(s.total_stations_active),
    total_quotations: num(s.total_quotations)
  };
}

function mapDashboard(d = {}) {
  return {
    summary: mapSummary(d.summary),
    suppliers_prices_today: Array.isArray(d.suppliers_prices_today) ? d.suppliers_prices_today : [],
    weekly_price_trends: Array.isArray(d.weekly_price_trends) ? d.weekly_price_trends : [],
    supplier_price_comparison: Array.isArray(d.supplier_price_comparison) ? d.supplier_price_comparison : []
  };
}

export async function getDashboardData({ station_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    return EMPTY_DASHBOARD;
  }
  const qs = new URLSearchParams();
  const sid = station_id ?? getStationId();
  if (sid && sid !== 'all') qs.set('station_id', sid);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getDashboardData${suffix}`);
  assertOk(res);
  return mapDashboard(res?.dashboard || {});
}
