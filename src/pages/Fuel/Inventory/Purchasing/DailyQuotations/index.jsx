import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../../../components/PageHeader.jsx';
import DataTable from '../../../../../components/crud/DataTable.jsx';
import FilterBar from '../../../../../components/crud/FilterBar.jsx';
import ConfirmDialog from '../../../../../components/crud/ConfirmDialog.jsx';
import ExportButtons from '../../../../../components/crud/ExportButtons.jsx';
import SummaryCard from '../../../../../components/crud/SummaryCard.jsx';
import StationRequired from '../../../../../components/crud/StationRequired.jsx';
import { useAuth } from '../../../../../auth/AuthContext.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getPersonsDropDown } from '../../../../../api/persons.js';
import { getQuotations, getQuotation, editQuotation, addQuotation, updateQuotation, deleteQuotation } from '../../../../../api/quotations.js';
import { quotationColumns, quotationLineColumns } from './columns.jsx';
import QuotationModal from './QuotationModal.jsx';

const SUPPLIER_TYPE = 2;
const today = () => new Date().toISOString().slice(0, 10);

export default function DailyQuotations() {
  const { can, activeStationId } = useAuth();
  const hasStation = !!activeStationId && activeStationId !== 'all';

  const [rows, setRows] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [quoteDate, setQuoteDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const canCreate = can('daily_quotations:create');
  const canUpdate = can('daily_quotations:update');
  const canDelete = can('daily_quotations:delete');
  const canExport = can('daily_quotations:export');

  useEffect(() => {
    if (!hasStation) {
      setSuppliers([]);
      return;
    }
    getPersonsDropDown({ person_type: SUPPLIER_TYPE })
      .then(setSuppliers)
      .catch(() => setSuppliers([]));
  }, [activeStationId, hasStation]);

  const load = useCallback(async () => {
    if (!hasStation) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getQuotations({
        station_id: activeStationId,
        supplier_id: supplierId || undefined,
        date: quoteDate || undefined
      });
      setRows(res.rows);
    } catch (err) {
      showToast(err?.message || 'Failed to load quotations', { variant: 'danger' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [hasStation, activeStationId, supplierId, quoteDate]);

  useEffect(() => {
    setExpanded(null);
  }, [activeStationId]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => setModal({ mode: 'create' });

  const openEdit = async (row) => {
    try {
      const full = await editQuotation(row.id, { station_id: activeStationId });
      setModal({ mode: 'edit', quotation: full });
    } catch (err) {
      showToast(err?.message || 'Failed to load quotation', { variant: 'danger' });
    }
  };

  const save = async (payload) => {
    if (modal.mode === 'create') await addQuotation(payload);
    else await updateQuotation(modal.quotation.id, payload);
    await load();
  };

  const remove = async (row) => {
    try {
      await deleteQuotation(row.id, { station_id: activeStationId });
      showToast('Quotation deleted', { variant: 'success' });
      if (expanded === row.id) setExpanded(null);
      await load();
    } catch (err) {
      showToast(err?.message || 'Failed to delete quotation', { variant: 'danger' });
    }
  };

  const toggleExpand = async (row) => {
    if (expanded === row.id) {
      setExpanded(null);
      return;
    }
    if (!row.children?.length) {
      try {
        const full = await getQuotation(row.id, { station_id: activeStationId });
        setRows((prev) => prev.map((r) => (r.id === row.id ? full : r)));
      } catch (err) {
        showToast(err?.message || 'Failed to load quotation items', { variant: 'danger' });
        return;
      }
    }
    setExpanded(row.id);
  };

  const rowActions = (row) => {
    const actions = [{ label: expanded === row.id ? 'Hide items' : 'View items', onClick: () => toggleExpand(row) }];
    if (canUpdate) actions.push({ label: 'Edit', onClick: () => openEdit(row) });
    if (canDelete) actions.push({ label: 'Delete', danger: true, onClick: () => setConfirm({ row }) });
    return actions;
  };

  const todayCount = useMemo(() => rows.filter((r) => r.date === today()).length, [rows]);

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Fuel · Purchasing"
        title="Daily quotations"
        actions={
          <>
            {canExport && hasStation && <ExportButtons columns={quotationColumns} rows={rows} filename="daily-quotations" />}
            {canCreate && (
              <button className="btn btn-primary" disabled={!hasStation} onClick={openCreate}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Add quotation
              </button>
            )}
          </>
        }
      />

      {!hasStation ? (
        <StationRequired resource="daily quotations" />
      ) : (
        <>
          <div className="row col-4">
            <SummaryCard icon="receipt" tone="teal" label="Total quotations" value={rows.length} />
            <SummaryCard icon="price" tone="blue" label="Suppliers quoted" value={new Set(rows.map((r) => r.supplier_id)).size} />
            <SummaryCard icon="fuel" tone="green" label="Today" value={todayCount} subtext="quotes" />
          </div>

          <FilterBar
            filters={[
              {
                label: 'Supplier',
                value: supplierId,
                onChange: setSupplierId,
                options: suppliers
              }
            ]}
            right={
              <input
                type="date"
                className="form-control"
                style={{ width: 'auto' }}
                aria-label="Quotation date"
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
              />
            }
          />

          <DataTable
            title="Supplier daily quotations"
            subtitle="One quotation per supplier per day — item prices from their daily quote"
            columns={quotationColumns}
            rows={rows}
            loading={loading}
            searchKeys={['supplier', 'remarks', 'date']}
            searchPlaceholder="Search quotations…"
            selectable={false}
            enableColumnToggle={false}
            rowActions={rowActions}
            emptyText="No quotations recorded yet."
          />

          {expanded != null && (() => {
            const row = rows.find((r) => r.id === expanded);
            if (!row?.children?.length) return null;
            return (
              <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                <div className="card-header">
                  <div className="card-title">
                    {row.supplier} — {row.date}
                  </div>
                  <div className="card-subtitle">{row.children.length} item(s)</div>
                </div>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        {quotationLineColumns().map((c) => (
                          <th key={c.key} style={c.align ? { textAlign: c.align } : undefined}>
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {row.children.map((line, i) => (
                        <tr key={line.id ?? i}>
                          {quotationLineColumns().map((c) => (
                            <td key={c.key} style={c.align ? { textAlign: c.align } : undefined}>
                              {c.render ? c.render(line) : line[c.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {modal && (
        <QuotationModal
          vendors={suppliers}
          stationId={activeStationId}
          quotation={modal.mode === 'edit' ? modal.quotation : null}
          onClose={() => setModal(null)}
          onSubmit={save}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete quotation?"
          body={`Delete the quotation from ${confirm.row.supplier} on ${confirm.row.date}?`}
          confirmLabel="Delete"
          onConfirm={() => remove(confirm.row)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
