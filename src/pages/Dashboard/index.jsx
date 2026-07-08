import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import SummaryCard from '../../components/crud/SummaryCard.jsx';
import ChartCard from '../../components/crud/ChartCard.jsx';
import { Donut, MultiLineChart } from '../../components/MiniCharts.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { showToast } from '../../v4/toast.js';
import { getDashboardData } from '../../api/dashboard.js';

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
  const p2 = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const supplierLabel = (r) => r?.supplier_name || (r?.supplier_id != null ? `Supplier #${r.supplier_id}` : '—');
  const itemLabel = (r) => r?.item_name || (r?.item_id != null ? `Item #${r.item_id}` : '—');
  const shortItem = (name = '') => {
    const words = String(name).trim().split(/\s+/);
    return words.length > 3 ? `${words.slice(0, 3).join(' ')}...` : name;
  };
  const moneyOrDash = (v) => (v == null ? '—' : usd(v));
  const numberOrDash = (v) => (v == null ? '—' : p2(v));

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

  const trendLabels = useMemo(() => [...new Set(trendRows.map((r) => r.date).filter(Boolean))].sort(), [trendRows]);
  const trendSeries = useMemo(() => {
    if (!trendLabels.length) return [];
    const buckets = trendRows.reduce((acc, row) => {
      const key = `${supplierLabel(row)} - ${shortItem(itemLabel(row))}`;
      if (!acc[key]) acc[key] = {};
      acc[key][row.date] = Number(row.avg_price) || 0;
      return acc;
    }, {});
    return Object.entries(buckets)
      .slice(0, 4)
      .map(([key, byDate], i) => ({
        label: key,
        color: chartColors[i % chartColors.length],
        data: trendLabels.map((d) => byDate[d] ?? 0)
      }));
  }, [trendRows, trendLabels]);

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

  const recentCompareRows = useMemo(() => {
    return [...compareRows]
      .sort((a, b) => {
        const ad = String(a.invoice_date || '');
        const bd = String(b.invoice_date || '');
        if (ad !== bd) return bd.localeCompare(ad);
        return Number(b.invoice_id || 0) - Number(a.invoice_id || 0);
      })
      .slice(0, 20);
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
        <ChartCard title="Weekly price trends (graph)" subtitle="Avg quoted price by supplier-item" height="auto">
          {loading ? (
            <div className="form-hint">Loading dashboard data…</div>
          ) : !trendSeries.length ? (
            <div className="form-hint">No trend data for chart.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ minHeight: 220 }}>
                <MultiLineChart series={trendSeries} labels={trendLabels} id="dashboard-weekly-trends" formatY={usd} />
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {trendSeries.map((s) => (
                  <div key={s.label} style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.color, marginRight: 6 }} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Comparison split " subtitle="Purchased amount distribution" height="auto">
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
            <div className="card-subtitle">Average, minimum and maximum quoted prices for today</div>
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
                  {/* <th style={{ textAlign: 'right' }}>Min</th> */}
                  {/* <th style={{ textAlign: 'right' }}>Max</th> */}
                </tr>
              </thead>
              <tbody>
                {todayRows.map((r, i) => (
                  <tr key={`${r.date}-${r.supplier_id}-${r.item_id}-${i}`}>
                    <td>{r.date || '—'}</td>
                    <td>{supplierLabel(r)}</td>
                    <td>{itemLabel(r)}</td>
                    <td style={{ textAlign: 'right' }}>{usd(r.avg_price)}</td>
                      {/* <td style={{ textAlign: 'right' }}>{usd(r.min_price)}</td> */}
                      {/* <td style={{ textAlign: 'right' }}>{usd(r.max_price)}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Supplier price comparison</div>
            <div className="card-subtitle">Invoice price vs same-day quoted price</div>
          </div>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="form-hint">Loading dashboard data…</div>
          ) : recentCompareRows.length === 0 ? (
            <div className="form-hint">No supplier comparison records found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Item</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Invoice Price</th>
                  <th style={{ textAlign: 'right' }}>Quoted Price</th>
                  <th style={{ textAlign: 'right' }}>Variance</th>
                  <th style={{ textAlign: 'right' }}>Purchased Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentCompareRows.map((r, i) => (
                  <tr key={`${r.invoice_id}-${r.supplier_id}-${r.item_id}-${i}`}>
                    <td>{r.invoice_id ?? '—'}</td>
                    <td>{r.invoice_date || '—'}</td>
                    <td>{supplierLabel(r)}</td>
                    <td>{itemLabel(r)}</td>
                    <td style={{ textAlign: 'right' }}>{qty(r.quantity)}</td>
                    <td style={{ textAlign: 'right' }}>{usd(r.invoice_price)}</td>
                    <td style={{ textAlign: 'right' }}>{moneyOrDash(r.quoted_price)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {r.price_variance == null ? (
                        '—'
                      ) : (
                        <span className={'status ' + (Number(r.price_variance) > 0 ? 'status-red' : 'status-green')}>
                          {Number(r.price_variance) > 0 ? '+' : ''}
                          {numberOrDash(r.price_variance)}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>{usd(r.purchased_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && compareRows.length > recentCompareRows.length && (
          <div className="form-hint" style={{ padding: '0 16px 14px' }}>
            Showing latest {recentCompareRows.length} rows out of {compareRows.length}.
          </div>
        )}
      </div> */}

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
