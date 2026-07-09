import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import FilterBar from '../../../components/crud/FilterBar.jsx';
import FormModal from '../../../components/crud/FormModal.jsx';
import ConfirmDialog from '../../../components/crud/ConfirmDialog.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { showToast } from '../../../v4/toast.js';
import { stationColumns, stationFields, STATUS_OPTIONS } from './columns.jsx';
import { getStations, editStation, addStation, updateStation, deleteStation } from '../../../api/stations.js';

const RECORDS = 10;

// UI column key → backend sort column (colName). Keys match stationColumns.
const COL_NAME = {
  name: 'name',
  code: 'code',
  brand: 'brand',
  city: 'city',
  manager_name: 'manager_name',
  status: 'status'
};

export default function StationList() {
  const navigate = useNavigate();
  const { can } = useAuth();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // 0-based; API is 1-based
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', row }
  const [confirm, setConfirm] = useState(null); // { row }

  const canCreate = can('stations:create');
  const canUpdate = can('stations:update');
  const canDelete = can('stations:delete');
  const canExport = can('stations:export');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStations({
        records: RECORDS,
        pageNo: page + 1,
        colName: COL_NAME[sort.key] || sort.key,
        sort: sort.dir,
        status
      });
      setRows(res.rows);
      setTotal(res.total);
    } catch (err) {
      showToast(err?.message || 'Failed to load stations', { variant: 'danger' });
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, sort, status]);

  useEffect(() => {
    load();
  }, [load]);

  const onSortChange = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(0);
  };

  const changeStatus = (v) => {
    setStatus(v);
    setPage(0);
  };

  const openEdit = async (row) => {
    try {
      const full = await editStation(row.id);
      setModal({ mode: 'edit', row: full });
    } catch (err) {
      showToast(err?.message || 'Failed to load station', { variant: 'danger' });
    }
  };

  const save = async (values) => {
    if (modal.mode === 'create') await addStation(values);
    else await updateStation(modal.row.id, values);
    await load();
  };

  const remove = async (row) => {
    try {
      await deleteStation(row.id);
      showToast('Station deleted', { variant: 'success' });
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      showToast(err?.message || 'Failed to delete station', { variant: 'danger' });
    }
  };

  const rowActions = (row) => {
    const items = [{ label: 'View details', onClick: () => navigate(`/stations/${row.id}`) }];
    if (canUpdate) items.push({ label: 'Edit', onClick: () => openEdit(row) });
    if (canDelete) items.push({ label: 'Delete', danger: true, onClick: () => setConfirm({ row }) });
    return items;
  };

  const summaryCards = [
    { icon: 'fuel', tone: 'teal', label: 'Total stations', value: total },
    { icon: 'fuel', tone: 'green', label: 'Active', value: rows.filter((r) => r.status === 'active').length, subtext: 'this page' },
    { icon: 'clock', tone: 'red', label: 'Inactive', value: rows.filter((r) => r.status === 'inactive').length, subtext: 'this page' },
    { icon: 'clock', tone: 'blue', label: '24/7', value: rows.filter((r) => r.is_24_hours).length, subtext: 'this page' }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader
        // pretitle="Network"
        title="Stations"
        actions={
          <>
            {canExport && <ExportButtons columns={stationColumns} rows={rows} filename="stations" />}
            {canCreate && (
              <button className="btn btn-primary" onClick={() => setModal({ mode: 'create', row: null })}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Add station
              </button>
            )}
          </>
        }
      />

      <div className="row col-4">
        {summaryCards.map((c, i) => (
          <SummaryCard key={i} {...c} />
        ))}
      </div>

      <FilterBar filters={[{ label: 'Status', value: status, onChange: changeStatus, options: STATUS_OPTIONS }]} />

      <DataTable
        serverMode
        title="All stations"
        columns={stationColumns}
        rows={rows}
        totalRows={total}
        page={page}
        onPageChange={setPage}
        sort={sort}
        onSortChange={onSortChange}
        loading={loading}
        pageSize={RECORDS}
        selectable={false}
        enableColumnToggle={false}
        rowActions={rowActions}
      />

      {modal && (
        <FormModal
          title={modal.mode === 'create' ? 'Add station' : 'Edit station'}
          fields={stationFields}
          initialValues={modal.row || {}}
          size="lg"
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal.mode === 'create' ? 'Create' : 'Save changes'}
          successMessage={modal.mode === 'create' ? 'Station created' : 'Changes saved'}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete station?"
          body="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => remove(confirm.row)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
