import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import SummaryCard from '../../components/crud/SummaryCard.jsx';
import ChartCard from '../../components/crud/ChartCard.jsx';
import { Donut } from '../../components/MiniCharts.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { showToast } from '../../v4/toast.js';
import { getDashboardData } from '../../api/dashboard.js';
import PriceTrends from './components/PriceTrends.jsx';

export default function Dashboard() {
  const { user, activeStationId } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardData({ station_id: activeStationId !== 'all' ? activeStationId : undefined })
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(err?.message || 'Failed to load dashboard data', { variant: 'danger' });
          setDashboard(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeStationId]);

  const summary = dashboard?.summary || {
    station_scope: 0,
    total_invoice_amount: 0,
    total_quantity_purchased: 0,
    total_suppliers: 0,
    total_stations_active: 0,
    total_quotations: 0
  };

  const usd = (n) =>
    `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const qty = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const supplierLabel = (r) => r?.supplier_name || (r?.supplier_id != null ? `Supplier #${r.supplier_id}` : '—');
  const itemLabel = (r) => r?.item_name || (r?.item_id != null ? `Item #${r.item_id}` : '—');

  const totals = [
    { icon: 'wallet', tone: 'teal', label: 'Total Invoice Amount', value: usd(summary.total_invoice_amount), subtext: 'From invoices' },
    { icon: 'fuel', tone: 'blue', label: 'Total Quantity Purchased', value: qty(summary.total_quantity_purchased), subtext: 'From purchased items' },
    { icon: 'truck', tone: 'green', label: 'Total Suppliers', value: summary.total_suppliers, subtext: 'Suppliers in scope' },
    { icon: 'fuel', tone: 'purple', label: 'Total Stations Active', value: summary.total_stations_active, subtext: 'Stations in scope' }
  ];

  const todayRows = dashboard?.suppliers_prices_today || [];
  const trendRows = dashboard?.weekly_price_trends || [];
  const compareRows = dashboard?.supplier_price_comparison || [];
  const chartColors = ['var(--blue)', 'var(--green)', 'var(--purple)', 'var(--yellow)', 'var(--teal)', 'var(--red)'];

  const purchasedBySupplier = useMemo(() => {
    const totalsBySupplier = compareRows.reduce((acc, row) => {
      const key = String(row.supplier_id ?? '0');
      acc[key] = (acc[key] || 0) + (Number(row.purchased_amount) || 0);
      return acc;
    }, {});
    const total = Object.values(totalsBySupplier).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(totalsBySupplier).map(([supplierId, value], i) => ({
      label: compareRows.find((r) => String(r.supplier_id ?? '0') === supplierId)?.supplier_name || `Supplier #${supplierId}`,
      value,
      pct: (value / total) * 100,
      color: chartColors[i % chartColors.length]
    }));
  }, [compareRows]);

  const varianceSplit = useMemo(() => {
    const overpay = compareRows
      .filter((r) => (Number(r.price_variance) || 0) > 0)
      .reduce((s, r) => s + (Number(r.purchased_amount) || 0), 0);
    const better = compareRows
      .filter((r) => (Number(r.price_variance) || 0) <= 0)
      .reduce((s, r) => s + (Number(r.purchased_amount) || 0), 0);
    const total = overpay + better || 1;
    return [
      { label: 'Above quote', value: overpay, pct: (overpay / total) * 100, color: 'var(--red)' },
      { label: 'At/Below quote', value: better, pct: (better / total) * 100, color: 'var(--green)' }
    ];
  }, [compareRows]);

  return (
    <div className="page-wrapper">
      <PageHeader pretitle={`Welcome back, ${user.name.split(' ')[0]}`} title="Dashboard" />

      <div className="row col-4">
        {totals.map((c) => (
          <SummaryCard key={c.label} {...c} />
        ))}
      </div>

      <div className="row col-2">
        <PriceTrends rows={trendRows} loading={loading} />

        <ChartCard title="Comparison split" subtitle="Purchased amount distribution" height="auto">
          {loading ? (
            <div className="form-hint">Loading dashboard data…</div>
          ) : !purchasedBySupplier.length ? (
            <div className="form-hint">No comparison data for pie chart.</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <Donut segments={purchasedBySupplier} centerNum={usd(summary.total_invoice_amount)} centerSub="invoice total" size={150} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
                {purchasedBySupplier.map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                    <span style={{ flex: 1 }}>{s.label}</span>
                    <span className="cell-strong">{s.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Supplier prices today</div>
            <div className="card-subtitle">Average quoted prices for today</div>
          </div>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="form-hint">Loading dashboard data…</div>
          ) : todayRows.length === 0 ? (
            <div className="form-hint">No supplier prices for today.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Item</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((r, i) => (
                  <tr key={`${r.date}-${r.supplier_id}-${r.item_id}-${i}`}>
                    <td>{r.date || '—'}</td>
                    <td>{supplierLabel(r)}</td>
                    <td>{itemLabel(r)}</td>
                    <td style={{ textAlign: 'right' }}>{usd(r.avg_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="row col-2">
        <ChartCard title="Price variance impact" subtitle="Invoice amount split by variance direction" height="auto">
          {loading ? (
            <div className="form-hint">Loading dashboard data…</div>
          ) : compareRows.length === 0 ? (
            <div className="form-hint">No variance records found.</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <Donut segments={varianceSplit} centerNum={String(compareRows.length)} centerSub="invoice items" size={140} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {varianceSplit.map((v) => (
                  <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: v.color }} />
                    <span style={{ minWidth: 110 }}>{v.label}</span>
                    <span className="cell-strong">{usd(v.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="form-hint" style={{ marginTop: 10 }}>
        Station scope: {summary.station_scope ?? 'Account-level'} · Quotations: {summary.total_quotations || 0}
      </div>
    </div>
  );
}
