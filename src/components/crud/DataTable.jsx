import { useEffect, useMemo, useRef, useState } from 'react';
import Dropdown from './Dropdown.jsx';

const RowActionsButton = ({ actions }) => (
  <Dropdown
    align="right"
    items={actions}
    trigger={({ toggle }) => (
      <button className="card-opt-btn" type="button" aria-label="Row actions" onClick={toggle}>
        <svg viewBox="0 0 16 16" fill="currentColor">
          <circle cx="3" cy="8" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="13" cy="8" r="1.4" />
        </svg>
      </button>
    )}
  />
);

function ColumnsMenu({ columns, hidden, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-outline btn-sm" type="button" onClick={() => setOpen((o) => !o)}>
        Columns
      </button>
      {open && (
        <div className="menu-popover" style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: 180 }}>
          {columns.map((c) => (
            <label
              key={c.key}
              className="menu-item"
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <input type="checkbox" checked={!hidden.has(c.key)} onChange={() => onToggle(c.key)} style={{ margin: 0 }} />
              {c.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Feature-complete table: search, sorting, pagination, column visibility, row
 * selection + bulk actions, and a per-row actions dropdown. Pagination is
 * structured so it can be swapped for server-side fetching later (it already
 * works on a "current page slice" model).
 */
export default function DataTable({
  columns,
  rows,
  getRowId = (r) => r.id,
  searchKeys,
  searchPlaceholder = 'Search…',
  pageSize = 8,
  rowActions,
  bulkActions = [],
  title,
  subtitle,
  toolbar,
  enableColumnToggle = true,
  selectable = true,
  emptyText = 'No records found.'
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [hidden, setHidden] = useState(() => new Set());

  const visibleColumns = columns.filter((c) => !hidden.has(c.key));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q && searchKeys) {
      out = rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
    }
    if (sort.key) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, query, sort, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(getRowId(r)));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((r) => next.delete(getRowId(r)));
      else pageRows.forEach((r) => next.add(getRowId(r)));
      return next;
    });
  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <div className="card">
      {(title || toolbar || searchKeys || enableColumnToggle) && (
        <div className="card-header">
          <div>
            {title && <div className="card-title">{title}</div>}
            <div className="card-subtitle">
              {selected.size > 0 ? `${selected.size} selected` : subtitle || `${filtered.length} records`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {searchKeys && (
              <div className="search-box" style={{ maxWidth: 230 }}>
                <svg className="s-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="7" r="5" />
                  <path d="M11 11l3.5 3.5" />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
            )}
            {enableColumnToggle && (
              <ColumnsMenu
                columns={columns}
                hidden={hidden}
                onToggle={(key) =>
                  setHidden((prev) => {
                    const next = new Set(prev);
                    next.has(key) ? next.delete(key) : next.add(key);
                    return next;
                  })
                }
              />
            )}
            {toolbar}
          </div>
        </div>
      )}

      {selected.size > 0 && bulkActions.length > 0 && (
        <div
          className="card-body"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--bg-surface-secondary)' }}
        >
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{selected.size} selected</span>
          {bulkActions.map((a) => (
            <button
              key={a.label}
              className={'btn btn-sm ' + (a.danger ? 'btn-outline' : 'btn-outline')}
              style={a.danger ? { color: 'var(--red)' } : undefined}
              onClick={() => {
                a.onClick(Array.from(selected));
                setSelected(new Set());
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: 32 }}>
                  <input type="checkbox" style={{ margin: 0 }} checked={allOnPageSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
              )}
              {visibleColumns.map((c) => (
                <th
                  key={c.key}
                  onClick={c.sortable === false ? undefined : () => toggleSort(c.key)}
                  style={{
                    cursor: c.sortable === false ? 'default' : 'pointer',
                    userSelect: 'none',
                    textAlign: c.align || 'left',
                    width: c.width
                  }}
                >
                  {c.label}
                  {sort.key === c.key && <span> {sort.dir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
              {rowActions && <th style={{ width: 40 }} />}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const id = getRowId(row);
              return (
                <tr key={id}>
                  {selectable && (
                    <td>
                      <input type="checkbox" style={{ margin: 0 }} checked={selected.has(id)} onChange={() => toggleRow(id)} aria-label="Select row" />
                    </td>
                  )}
                  {visibleColumns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align || 'left' }}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td style={{ textAlign: 'right' }}>
                      <RowActionsButton actions={rowActions(row)} />
                    </td>
                  )}
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={colSpan} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          Showing {filtered.length === 0 ? 0 : safePage * pageSize + 1}–
          {Math.min(filtered.length, safePage * pageSize + pageSize)} of {filtered.length}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            ← Prev
          </button>
          {Array.from({ length: pageCount }, (_, i) => i)
            .filter((i) => Math.abs(i - safePage) < 3 || i === 0 || i === pageCount - 1)
            .map((i, idx, arr) => (
              <span key={i} style={{ display: 'inline-flex', gap: 6 }}>
                {idx > 0 && arr[idx - 1] !== i - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 2px' }}>…</span>}
                <button className={'btn btn-sm ' + (i === safePage ? 'btn-primary' : 'btn-outline')} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              </span>
            ))}
          <button className="btn btn-outline btn-sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
