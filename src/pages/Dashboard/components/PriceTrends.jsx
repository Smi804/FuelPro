import { useMemo, useState } from 'react';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import { MultiLineChart } from '../../../components/MiniCharts.jsx';

const usd = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLORS = [
  'var(--blue)',
  'var(--green)',
  'var(--purple)',
  'var(--yellow)',
  'var(--teal)',
  'var(--red)',
  'var(--orange, #f59e0b)',
  'var(--cyan, #06b6d4)',
  'var(--pink, #ec4899)',
  'var(--indigo, #6366f1)',
  'var(--lime, #84cc16)',
  'var(--amber, #d97706)'
];

const shortDate = (d) => {
  if (!d) return '';
  const parts = String(d).split('-');
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
};

/**
 * Weekly price trends from getDashboardData.weekly_price_trends.
 * One line per supplier+item so every quoted grade is included.
 */
export default function PriceTrends({ rows = [], loading = false }) {
  const [supplierId, setSupplierId] = useState('all');

  const suppliers = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (r.supplier_id == null) return;
      const id = String(r.supplier_id);
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: r.supplier_name || `Supplier #${r.supplier_id}`
        });
      }
    });
    return [...map.values()];
  }, [rows]);

  // Disambiguate duplicate supplier names (e.g. two "Windecker Petroleum" ids).
  const supplierDisplay = useMemo(() => {
    const counts = suppliers.reduce((acc, s) => {
      acc[s.name] = (acc[s.name] || 0) + 1;
      return acc;
    }, {});
    const out = {};
    suppliers.forEach((s) => {
      out[s.id] = counts[s.name] > 1 ? `${s.name} (#${s.id})` : s.name;
    });
    return out;
  }, [suppliers]);

  const dates = useMemo(() => [...new Set(rows.map((r) => r.date).filter(Boolean))].sort(), [rows]);

  const allSeries = useMemo(() => {
    if (!dates.length) return [];
    const buckets = new Map();
    rows.forEach((r) => {
      const sid = r.supplier_id;
      const iid = r.item_id;
      if (sid == null || iid == null || !r.date) return;
      const key = `${sid}|${iid}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          supplier_id: String(sid),
          item_id: String(iid),
          item_name: r.item_name || `Item #${iid}`,
          byDate: {}
        });
      }
      buckets.get(key).byDate[r.date] = Number(r.avg_price);
    });

    return [...buckets.values()].map((b, i) => ({
      key: b.key,
      supplier_id: b.supplier_id,
      label: `${supplierDisplay[b.supplier_id] || `Supplier #${b.supplier_id}`} · ${b.item_name}`,
      shortLabel: b.item_name,
      color: COLORS[i % COLORS.length],
      data: dates.map((d) => (b.byDate[d] != null && !Number.isNaN(b.byDate[d]) ? b.byDate[d] : null))
    }));
  }, [rows, dates, supplierDisplay]);

  const series = useMemo(() => {
    if (supplierId === 'all') return allSeries;
    return allSeries.filter((s) => s.supplier_id === String(supplierId));
  }, [allSeries, supplierId]);

  const chartSeries = useMemo(
    () =>
      series.map((s) => ({
        label: s.label,
        color: s.color,
        data: s.data
      })),
    [series]
  );

  const labels = useMemo(() => dates.map(shortDate), [dates]);

  const selectedName =
    supplierId === 'all' ? 'All suppliers' : supplierDisplay[supplierId] || `Supplier #${supplierId}`;

  return (
    <ChartCard
      title="Weekly price trends"
      height="auto"
      subtitle={`${selectedName} · each line is one item · last ${dates.length || 0} day(s) · $/gal`}
    >
      {loading ? (
        <div className="form-hint">Loading dashboard data…</div>
      ) : !rows.length ? (
        <div className="form-hint">No weekly trend records found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              className={'btn btn-sm ' + (supplierId === 'all' ? 'btn-primary' : 'btn-secondary')}
              onClick={() => setSupplierId('all')}
            >
              All suppliers
            </button>
            {suppliers.map((s) => (
              <button
                key={s.id}
                type="button"
                className={'btn btn-sm ' + (supplierId === s.id ? 'btn-primary' : 'btn-secondary')}
                onClick={() => setSupplierId(s.id)}
              >
                {supplierDisplay[s.id]}
              </button>
            ))}
          </div>

          <div style={{ minHeight: 220 }}>
            {chartSeries.length ? (
              <MultiLineChart series={chartSeries} labels={labels} id="weekly-price-trends" formatY={usd} />
            ) : (
              <div className="form-hint">No items for this supplier.</div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 8,
              paddingTop: 4,
              borderTop: '1px solid var(--border-color-light)'
            }}
          >
            {series.map((s) => {
              const vals = s.data.filter((v) => v != null);
              const last = vals.length ? vals[vals.length - 1] : null;
              const prev = vals.length > 1 ? vals[vals.length - 2] : null;
              const chg = last != null && prev != null ? last - prev : null;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, minWidth: 0 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.label}>
                    {supplierId === 'all' ? s.label : s.shortLabel}
                  </span>
                  {last != null && <span className="cell-strong">{usd(last)}</span>}
                  {chg != null && (
                    <span style={{ color: chg >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 11.5 }}>
                      {chg >= 0 ? '▲' : '▼'} {usd(Math.abs(chg))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
