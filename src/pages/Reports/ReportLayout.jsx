import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/crud/DataTable.jsx';
import ExportButtons from '../../components/crud/ExportButtons.jsx';
import Can from '../../auth/Can.jsx';
import { stationIdOptions } from '../../data/options.js';

/**
 * Shared layout for every report: header + export, a date-range / station
 * filter row, an optional chart area, and a data table — matching the UI
 * guidelines (Header → Filters → Charts → Tables).
 */
export default function ReportLayout({ title, summary, chart, columns, rows, exportName }) {
  const [range, setRange] = useState({ from: '2026-06-01', to: '2026-06-23', stationId: '' });

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Reports"
        title={title}
        actions={
          <Can perm="reports:export">
            <ExportButtons columns={columns} rows={rows} filename={exportName} />
          </Can>
        }
      />

      {summary && <div className="row col-3">{summary}</div>}

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Station</label>
            <select className="form-control" value={range.stationId} onChange={(e) => setRange((r) => ({ ...r, stationId: e.target.value }))}>
              <option value="">All stations</option>
              {stationIdOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>Apply filters</button>
        </div>
      </div>

      {chart}

      <DataTable title={`${title} detail`} columns={columns} rows={rows} selectable={false} enableColumnToggle={false} />
    </div>
  );
}
