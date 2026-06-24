import { useMemo, useState } from 'react';
import PageHeader from '../PageHeader.jsx';
import DataTable from './DataTable.jsx';
import FilterBar from './FilterBar.jsx';
import FormModal from './FormModal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import ExportButtons from './ExportButtons.jsx';
import SummaryCard from './SummaryCard.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { showToast } from '../../v4/toast.js';

let seq = 1000;
const nextId = (prefix) => `${prefix}_${++seq}`;

/**
 * Generic, config-driven CRUD list page used by most modules. Composes the
 * shared PageHeader + summary cards + FilterBar + DataTable + FormModal, and
 * gates Add/Edit/Delete on RBAC permissions for `perm`.
 */
export default function ResourcePage({
  perm,
  title,
  pretitle,
  data,
  columns,
  getRowId = (r) => r.id,
  searchKeys,
  searchPlaceholder,
  formFields,
  filters = [],
  summary,
  addLabel = 'Add',
  exportName = 'export',
  pageSize = 8,
  extraActions
}) {
  const { can, activeStationId } = useAuth();
  const [rows, setRows] = useState(data);
  const [filterValues, setFilterValues] = useState({});
  const [modal, setModal] = useState(null); // { mode, row }
  const [confirm, setConfirm] = useState(null); // { row }

  // Scope to the station picked in the topbar. Only rows that carry a
  // `stationId` are affected; station-agnostic resources are left untouched.
  const stationScoped = useMemo(() => {
    if (activeStationId === 'all') return rows;
    return rows.filter(
      (r) => !Object.prototype.hasOwnProperty.call(r, 'stationId') || r.stationId === activeStationId
    );
  }, [rows, activeStationId]);

  const filtered = useMemo(() => {
    return stationScoped.filter((r) =>
      filters.every((f) => {
        const v = filterValues[f.key];
        return !v || String(r[f.key]) === v;
      })
    );
  }, [stationScoped, filterValues, filters]);

  const canCreate = can(`${perm}:create`);
  const canUpdate = can(`${perm}:update`);
  const canDelete = can(`${perm}:delete`);
  const canExport = can(`${perm}:export`);

  const fieldsFor = (row) => (typeof formFields === 'function' ? formFields(row) : formFields);

  const save = (values) => {
    if (modal.mode === 'create') {
      setRows((prev) => [{ ...values, id: nextId(perm) }, ...prev]);
    } else {
      setRows((prev) => prev.map((r) => (getRowId(r) === getRowId(modal.row) ? { ...r, ...values } : r)));
    }
  };

  const remove = (row) => {
    setRows((prev) => prev.filter((r) => getRowId(r) !== getRowId(row)));
    showToast(`${title.replace(/s$/, '')} deleted`, { variant: 'success' });
  };

  const rowActions = (row) => {
    const items = [];
    if (extraActions) items.push(...extraActions(row));
    if (canUpdate) items.push({ label: 'Edit', onClick: () => setModal({ mode: 'edit', row }) });
    if (canDelete) items.push({ label: 'Delete', danger: true, onClick: () => setConfirm({ row }) });
    return items.length ? items : [{ label: 'No actions', onClick: () => {} }];
  };

  const summaryCards = summary ? summary(stationScoped) : null;

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle={pretitle}
        title={title}
        actions={
          <>
            {canExport && <ExportButtons columns={columns} rows={filtered} filename={exportName} />}
            {canCreate && formFields && (
              <button className="btn btn-primary" onClick={() => setModal({ mode: 'create', row: null })}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                {addLabel}
              </button>
            )}
          </>
        }
      />

      {summaryCards && (
        <div className={'row ' + (summaryCards.length === 3 ? 'col-3' : 'col-4')}>
          {summaryCards.map((c, i) => (
            <SummaryCard key={i} {...c} />
          ))}
        </div>
      )}

      {filters.length > 0 && (
        <FilterBar
          filters={filters.map((f) => ({
            label: f.label,
            value: filterValues[f.key] || '',
            onChange: (v) => setFilterValues((p) => ({ ...p, [f.key]: v })),
            options: f.options
          }))}
        />
      )}

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={getRowId}
        searchKeys={searchKeys}
        searchPlaceholder={searchPlaceholder}
        pageSize={pageSize}
        rowActions={formFields || extraActions ? rowActions : undefined}
        title={`All ${title.toLowerCase()}`}
      />

      {modal && formFields && (
        <FormModal
          title={modal.mode === 'create' ? `${addLabel}` : `Edit ${title.replace(/s$/, '')}`}
          fields={fieldsFor(modal.row)}
          initialValues={modal.row || {}}
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal.mode === 'create' ? 'Create' : 'Save changes'}
          successMessage={modal.mode === 'create' ? `${title.replace(/s$/, '')} created` : 'Changes saved'}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={`Delete ${title.replace(/s$/, '').toLowerCase()}?`}
          body="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => remove(confirm.row)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
