import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { itemColumns, itemFields, STATUS_OPTIONS, TYPE_OPTIONS } from './columns.jsx';
import { getItems, editItem, addItem, updateItem, deleteItem } from '../../../api/items.js';
import { getBrandsDropDown } from '../../../api/brands.js';

const RECORDS = 10;

// UI sort key → backend colName. Relational columns aren't server-sortable.
const COL_NAME = { name: 'name', type: 'type', sku: 'sku', status: 'status' };

export default function ItemList() {
  const { can, activeStationId } = useAuth();
  const hasStation = !!activeStationId && activeStationId !== 'all';

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [brands, setBrands] = useState([]);

  const canCreate = can('items:create');
  const canUpdate = can('items:update');
  const canDelete = can('items:delete');
  const canExport = can('items:export');

  // Brand options for the form — scoped to the active station.
  useEffect(() => {
    if (!hasStation) {
      setBrands([]);
      return;
    }
    getBrandsDropDown({ station_id: activeStationId })
      .then(setBrands)
      .catch(() => setBrands([]));
  }, [hasStation, activeStationId]);

  const load = useCallback(async () => {
    if (!hasStation) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getItems({ records: RECORDS, pageNo: page + 1, colName: COL_NAME[sort.key] || sort.key, sort: sort.dir, type, status, station_id: activeStationId });
      setRows(res.rows);
      setTotal(res.total);
    } catch (err) {
      showToast(err?.message || 'Failed to load items', { variant: 'danger' });
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [hasStation, activeStationId, page, sort, type, status]);

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

  const changeType = (v) => {
    setType(v);
    setPage(0);
  };
  const changeStatus = (v) => {
    setStatus(v);
    setPage(0);
  };

  const fields = useMemo(() => itemFields({ brands }), [brands]);

  const openEdit = async (row) => {
    try {
      const full = await editItem(row.id);
      setModal({ mode: 'edit', row: full });
    } catch (err) {
      showToast(err?.message || 'Failed to load item', { variant: 'danger' });
    }
  };

  const save = async (values) => {
    if (modal.mode === 'create') await addItem(values);
    else await updateItem(modal.row.id, values);
    await load();
  };

  const remove = async (row) => {
    try {
      await deleteItem(row.id);
      showToast('Item deleted', { variant: 'success' });
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      showToast(err?.message || 'Failed to delete item', { variant: 'danger' });
    }
  };

  const rowActions = (row) => {
    const items = [];
    if (canUpdate) items.push({ label: 'Edit', onClick: () => openEdit(row) });
    if (canDelete) items.push({ label: 'Delete', danger: true, onClick: () => setConfirm({ row }) });
    return items;
  };

  const summaryCards = [
    { icon: 'inventory', tone: 'teal', label: 'Total items', value: total },
    { icon: 'fuel', tone: 'blue', label: 'Fuel', value: rows.filter((r) => r.type === 'FUEL').length, subtext: 'this page' },
    { icon: 'shop', tone: 'green', label: 'Retail', value: rows.filter((r) => r.type === 'RETAIL').length, subtext: 'this page' },
    { icon: 'tag', tone: 'red', label: 'Inactive', value: rows.filter((r) => Number(r.status) === 0).length, subtext: 'this page' }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Catalog"
        title="Fuel Grades"
        actions={
          <>
            {canExport && hasStation && <ExportButtons columns={itemColumns} rows={rows} filename="items" />}
            {canCreate && (
              <button className="btn btn-primary" disabled={!hasStation} onClick={() => setModal({ mode: 'create', row: null })}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Add item
              </button>
            )}
          </>
        }
      />

      {!hasStation ? (
        <StationRequired resource="items" />
      ) : (
        <>
          <div className="row col-4">
            {summaryCards.map((c, i) => (
              <SummaryCard key={i} {...c} />
            ))}
          </div>

          <FilterBar
            filters={[
              { label: 'Type', value: type, onChange: changeType, options: TYPE_OPTIONS },
              { label: 'Status', value: status, onChange: changeStatus, options: STATUS_OPTIONS }
            ]}
          />

          <DataTable
            serverMode
            title="All items"
            columns={itemColumns}
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
          title={modal.mode === 'create' ? 'Add item' : 'Edit item'}
          fields={fields}
          initialValues={modal.row || {}}
          size="lg"
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal.mode === 'create' ? 'Create' : 'Save changes'}
          successMessage={modal.mode === 'create' ? 'Item created' : 'Changes saved'}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete item?"
          body="Items referenced by orders or invoices can't be deleted."
          confirmLabel="Delete"
          onConfirm={() => remove(confirm.row)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
