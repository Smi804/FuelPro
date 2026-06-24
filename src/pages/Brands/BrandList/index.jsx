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
import { brandColumns, brandFields, STATUS_OPTIONS } from './columns.jsx';
import { getBrands, editBrand, addBrand, updateBrand, deleteBrand } from '../../../api/brands.js';

const RECORDS = 10;

const COL_NAME = { name: 'name', status: 'status' };

export default function BrandList() {
  const { can, activeStationId } = useAuth();
  const hasStation = !!activeStationId && activeStationId !== 'all';

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const canCreate = can('brands:create');
  const canUpdate = can('brands:update');
  const canDelete = can('brands:delete');
  const canExport = can('brands:export');

  const load = useCallback(async () => {
    if (!hasStation) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getBrands({ records: RECORDS, pageNo: page + 1, colName: COL_NAME[sort.key] || sort.key, sort: sort.dir, status });
      setRows(res.rows);
      setTotal(res.total);
    } catch (err) {
      showToast(err?.message || 'Failed to load brands', { variant: 'danger' });
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [hasStation, activeStationId, page, sort, status]);

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

  const changeStatus = (v) => {
    setStatus(v);
    setPage(0);
  };

  const openEdit = async (row) => {
    try {
      const full = await editBrand(row.id);
      setModal({ mode: 'edit', row: full });
    } catch (err) {
      showToast(err?.message || 'Failed to load brand', { variant: 'danger' });
    }
  };

  const save = async (values) => {
    if (modal.mode === 'create') await addBrand(values);
    else await updateBrand(modal.row.id, values);
    await load();
  };

  const remove = async (row) => {
    try {
      await deleteBrand(row.id);
      showToast('Brand deleted', { variant: 'success' });
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      showToast(err?.message || 'Failed to delete brand', { variant: 'danger' });
    }
  };

  const rowActions = (row) => {
    const items = [];
    if (canUpdate) items.push({ label: 'Edit', onClick: () => openEdit(row) });
    if (canDelete) items.push({ label: 'Delete', danger: true, onClick: () => setConfirm({ row }) });
    return items;
  };

  const summaryCards = [
    { icon: 'tag', tone: 'teal', label: 'Total brands', value: total },
    { icon: 'tag', tone: 'green', label: 'Active', value: rows.filter((r) => Number(r.status) === 1).length, subtext: 'this page' },
    { icon: 'tag', tone: 'red', label: 'Inactive', value: rows.filter((r) => Number(r.status) === 0).length, subtext: 'this page' }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Catalog"
        title="Brands"
        actions={
          <>
            {canExport && hasStation && <ExportButtons columns={brandColumns} rows={rows} filename="brands" />}
            {canCreate && (
              <button className="btn btn-primary" disabled={!hasStation} onClick={() => setModal({ mode: 'create', row: null })}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Add brand
              </button>
            )}
          </>
        }
      />

      {!hasStation ? (
        <StationRequired resource="brands" />
      ) : (
        <>
          <div className="row col-4">
            {summaryCards.map((c, i) => (
              <SummaryCard key={i} {...c} />
            ))}
          </div>

          <FilterBar filters={[{ label: 'Status', value: status, onChange: changeStatus, options: STATUS_OPTIONS }]} />

          <DataTable
            serverMode
            title="All brands"
            columns={brandColumns}
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
          title={modal.mode === 'create' ? 'Add brand' : 'Edit brand'}
          fields={brandFields}
          initialValues={modal.row || {}}
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal.mode === 'create' ? 'Create' : 'Save changes'}
          successMessage={modal.mode === 'create' ? 'Brand created' : 'Changes saved'}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete brand?"
          body="Brands linked to items can't be deleted."
          confirmLabel="Delete"
          onConfirm={() => remove(confirm.row)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
