import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import FilterBar from '../../../components/crud/FilterBar.jsx';
import FormModal from '../../../components/crud/FormModal.jsx';
import ConfirmDialog from '../../../components/crud/ConfirmDialog.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import StationRequired from '../../../components/crud/StationRequired.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { showToast } from '../../../v4/toast.js';
import { taxColumns, taxFields } from './columns.jsx';
import { getTaxes, editTax, addTax, updateTax, deleteTax } from '../../../api/taxes.js';

const RECORDS = 10;

const COL_NAME = { code: 'code', description: 'description', price: 'price' };

export default function TaxList() {
  const { can, activeStationId } = useAuth();
  const hasStation = !!activeStationId && activeStationId !== 'all';

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ key: 'code', dir: 'asc' });
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const canCreate = can('taxes:create');
  const canUpdate = can('taxes:update');
  const canDelete = can('taxes:delete');
  const canExport = can('taxes:export');

  const load = useCallback(async () => {
    if (!hasStation) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getTaxes({
        records: RECORDS,
        pageNo: page + 1,
        colName: COL_NAME[sort.key] || sort.key,
        sort: sort.dir,
        code,
        station_id: activeStationId
      });
      setRows(res.rows);
      setTotal(res.total);
    } catch (err) {
      showToast(err?.message || 'Failed to load taxes', { variant: 'danger' });
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [hasStation, activeStationId, page, sort, code]);

  useEffect(() => {
    setPage(0);
  }, [activeStationId]);

  useEffect(() => {
    load();
  }, [load]);

  const onSortChange = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(0);
  };

  const changeCode = (v) => {
    setCode(v);
    setPage(0);
  };

  const openEdit = async (row) => {
    try {
      const full = await editTax(row.id, { station_id: activeStationId });
      setModal({ mode: 'edit', row: full });
    } catch (err) {
      showToast(err?.message || 'Failed to load tax', { variant: 'danger' });
    }
  };

  const save = async (values) => {
    const payload = { ...values, station_id: activeStationId };
    if (modal.mode === 'create') await addTax(payload);
    else await updateTax(modal.row.id, payload);
    await load();
  };

  const remove = async (row) => {
    try {
      await deleteTax(row.id, { station_id: activeStationId });
      showToast('Tax deleted', { variant: 'success' });
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      showToast(err?.message || 'Failed to delete tax', { variant: 'danger' });
    }
  };

  const rowActions = (row) => {
    const items = [];
    if (canUpdate) items.push({ label: 'Edit', onClick: () => openEdit(row) });
    if (canDelete) items.push({ label: 'Delete', danger: true, onClick: () => setConfirm({ row }) });
    return items;
  };

  const summaryCards = [
    { icon: 'price', tone: 'teal', label: 'Total taxes', value: total },
    { icon: 'price', tone: 'blue', label: 'On this page', value: rows.length, subtext: 'taxes' }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Catalog"
        title="Taxes"
        actions={
          <>
            {canExport && hasStation && <ExportButtons columns={taxColumns} rows={rows} filename="taxes" />}
            {canCreate && (
              <button className="btn btn-primary" disabled={!hasStation} onClick={() => setModal({ mode: 'create', row: null })}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Add tax
              </button>
            )}
          </>
        }
      />

      {!hasStation ? (
        <StationRequired resource="taxes" />
      ) : (
        <>
          <div className="row col-4">
            {summaryCards.map((c, i) => (
              <SummaryCard key={i} {...c} />
            ))}
          </div>

          <FilterBar search={{ value: code, onChange: changeCode, placeholder: 'Filter by code…' }} />

          <DataTable
            serverMode
            title="All taxes"
            columns={taxColumns}
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
        </>
      )}

      {modal && (
        <FormModal
          title={modal.mode === 'create' ? 'Add tax' : 'Edit tax'}
          fields={taxFields}
          initialValues={modal.row || {}}
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal.mode === 'create' ? 'Create' : 'Save changes'}
          successMessage={modal.mode === 'create' ? 'Tax created' : 'Changes saved'}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete tax?"
          body={`Delete tax "${confirm.row.code}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => remove(confirm.row)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
