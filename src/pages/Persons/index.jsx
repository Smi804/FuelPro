import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/crud/DataTable.jsx';
import FilterBar from '../../components/crud/FilterBar.jsx';
import FormModal from '../../components/crud/FormModal.jsx';
import ConfirmDialog from '../../components/crud/ConfirmDialog.jsx';
import ExportButtons from '../../components/crud/ExportButtons.jsx';
import SummaryCard from '../../components/crud/SummaryCard.jsx';
import StationRequired from '../../components/crud/StationRequired.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { showToast } from '../../v4/toast.js';
import { personColumns, personFields, STATUS_OPTIONS } from './columns.jsx';
import { getPersons, getPersonTypes, editPerson, addPerson, updatePerson, deletePerson, togglePersonActive } from '../../api/persons.js';

const RECORDS = 10;

// UI sort key → backend colName. Relational/derived columns aren't server-sortable.
const COL_NAME = { name: 'name', phone_no: 'phone_no', cnic: 'cnic', opening_balance: 'opening_balance', isActive: 'isActive' };

export default function Persons() {
  const { can, activeStationId } = useAuth();
  const hasStation = !!activeStationId && activeStationId !== 'all';

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [personType, setPersonType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [personTypes, setPersonTypes] = useState([]);

  const canCreate = can('persons:create');
  const canUpdate = can('persons:update');
  const canDelete = can('persons:delete');
  const canExport = can('persons:export');

  // Person-type options (for filter + form). No station required.
  useEffect(() => {
    getPersonTypes()
      .then(setPersonTypes)
      .catch(() => setPersonTypes([]));
  }, []);

  const load = useCallback(async () => {
    if (!hasStation) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getPersons({
        records: RECORDS,
        pageNo: page + 1,
        colName: COL_NAME[sort.key] || sort.key,
        sort: sort.dir,
        person_type: personType,
        status
      });
      setRows(res.rows);
      setTotal(res.total);
    } catch (err) {
      showToast(err?.message || 'Failed to load persons', { variant: 'danger' });
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [hasStation, activeStationId, page, sort, personType, status]);

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
    setPersonType(v);
    setPage(0);
  };
  const changeStatus = (v) => {
    setStatus(v);
    setPage(0);
  };

  const fields = useMemo(() => personFields({ personTypes }), [personTypes]);

  const openEdit = async (row) => {
    try {
      const full = await editPerson(row.id);
      setModal({ mode: 'edit', row: full });
    } catch (err) {
      showToast(err?.message || 'Failed to load person', { variant: 'danger' });
    }
  };

  const save = async (values) => {
    if (modal.mode === 'create') await addPerson(values);
    else await updatePerson(modal.row.id, values);
    await load();
  };

  const remove = async (row) => {
    try {
      await deletePerson(row.id);
      showToast('Person deleted', { variant: 'success' });
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      showToast(err?.message || 'Failed to delete person', { variant: 'danger' });
    }
  };

  const toggleActive = async (row) => {
    try {
      const res = await togglePersonActive(row.id);
      showToast(res?.message || 'Status updated', { variant: 'success' });
      await load();
    } catch (err) {
      showToast(err?.message || 'Failed to update status', { variant: 'danger' });
    }
  };

  const rowActions = (row) => {
    const items = [];
    if (canUpdate) items.push({ label: 'Edit', onClick: () => openEdit(row) });
    if (canUpdate) {
      items.push({
        label: Number(row.isActive) === 1 ? 'Deactivate' : 'Activate',
        onClick: () => toggleActive(row)
      });
    }
    if (canDelete) items.push({ label: 'Delete', danger: true, onClick: () => setConfirm({ row }) });
    return items;
  };

  const countType = (label) => rows.filter((r) => r.person_type_label === label).length;
  const summaryCards = [
    { icon: 'users', tone: 'teal', label: 'Total people', value: total },
    { icon: 'users', tone: 'blue', label: 'Customers', value: countType('Customer'), subtext: 'this page' },
    { icon: 'truck', tone: 'yellow', label: 'Suppliers', value: countType('Supplier'), subtext: 'this page' },
    { icon: 'profile', tone: 'green', label: 'Employees', value: countType('Employee'), subtext: 'this page' }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="People"
        title="Persons"
        actions={
          <>
            {canExport && hasStation && <ExportButtons columns={personColumns} rows={rows} filename="persons" />}
            {canCreate && (
              <button className="btn btn-primary" disabled={!hasStation} onClick={() => setModal({ mode: 'create', row: null })}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Add person
              </button>
            )}
          </>
        }
      />

      {!hasStation ? (
        <StationRequired resource="persons" />
      ) : (
        <>
          <div className="row col-4">
            {summaryCards.map((c, i) => (
              <SummaryCard key={i} {...c} />
            ))}
          </div>

          <FilterBar
            filters={[
              { label: 'Type', value: personType, onChange: changeType, options: personTypes.map((t) => ({ value: t.value, label: t.label })) },
              { label: 'Status', value: status, onChange: changeStatus, options: STATUS_OPTIONS }
            ]}
          />

          <DataTable
            serverMode
            title="All persons"
            columns={personColumns}
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
          title={modal.mode === 'create' ? 'Add person' : 'Edit person'}
          fields={fields}
          initialValues={modal.row || {}}
          size="lg"
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal.mode === 'create' ? 'Create' : 'Save changes'}
          successMessage={modal.mode === 'create' ? 'Person created' : 'Changes saved'}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete person?"
          body="People referenced by vouchers or invoices can't be deleted."
          confirmLabel="Delete"
          onConfirm={() => remove(confirm.row)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
