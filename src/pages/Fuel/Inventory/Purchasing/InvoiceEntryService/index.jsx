import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../../../components/PageHeader.jsx';
import DataTable from '../../../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../../../components/crud/StatusBadge.jsx';
import FormModal from '../../../../../components/crud/FormModal.jsx';
import Tabs from '../../../../../components/crud/Tabs.jsx';
import Modal from '../../../../../components/Modal.jsx';
import Toggle from '../../../../../components/Toggle.jsx';
import { useAuth } from '../../../../../auth/AuthContext.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getPersonsDropDown } from '../../../../../api/persons.js';
import { addInvoice as uploadInvoiceApi, getInvoices } from '../../../../../api/invoices.js';
import InvoiceUploadModal from './InvoiceUploadModal.jsx';
import { IEL_RESULT, INVOICE_TYPE, DOC_TYPE, UPLOAD_STATUS } from '../../../../../data/mock/fuel.js';

// No backend API for these sections yet — start empty (no dummy data).
const INVOICE_ENTRY_LOG = [];
const INVOICE_ERRORS = [];

const money = (n) => `€${Number(n).toLocaleString()}`;
const today = () => new Date().toISOString().slice(0, 10);

// Supplier person_type id on the backend.
const SUPPLIER_TYPE = 2;

let seq = 5000;
const nextId = (p) => `${p}_${++seq}`;

const isImage = (f) =>
  (f?.type && f.type.startsWith('image/')) || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f?.name || '');

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'uploaded', label: 'Uploaded Invoices' },
  { key: 'errors', label: 'Invoices Error' },
  { key: 'bank', label: 'Upload Bank Statement' }
];

const logColumns = [
  { key: 'time', label: 'Time' },
  { key: 'source', label: 'Source' },
  { key: 'invoice', label: 'Invoice', render: (r) => <span className="cell-strong">{r.invoice}</span> },
  { key: 'result', label: 'Result', render: (r) => <StatusBadge value={r.result} map={IEL_RESULT} />, exportValue: (r) => r.result },
  { key: 'detail', label: 'Detail' }
];

const errorColumns = [
  { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
  { key: 'type', label: 'Type', render: (r) => <StatusBadge value={r.type} map={INVOICE_TYPE} />, exportValue: (r) => r.type },
  { key: 'vendor', label: 'Vendor' },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => money(r.amount) },
  { key: 'reason', label: 'Error', render: (r) => <span style={{ color: 'var(--red)' }}>{r.reason}</span> },
  { key: 'date', label: 'Date' }
];

// File cell: a "View" button when the upload is stored, otherwise the name.
const fileCell = (onPreview) => (r) =>
  r.fileUrl ? (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={() => onPreview({ name: r.fileName, url: r.fileUrl, type: r.fileType })}
    >
      View
    </button>
  ) : (
    <span style={{ color: 'var(--text-muted)' }}>{r.fileName}</span>
  );

// ── Upload form schemas ─────────────────────────────────────────
const bankFields = [
  { name: 'bank', label: 'Bank', required: true, placeholder: 'e.g. Swedbank' },
  { name: 'period', label: 'Statement period', required: true, placeholder: 'e.g. Jun 2026' },
  { name: 'file', label: 'Upload statement (PDF / image / CSV)', type: 'file', accept: '.pdf,.csv,image/*', required: true, span: 2 }
];

export default function InvoiceEntryService() {
  const { can, activeStationId } = useAuth();
  const canCreate = can('invoice_entry_service:create');

  const [tab, setTab] = useState('summary');
  const [enabled, setEnabled] = useState(true);
  const [uploaded, setUploaded] = useState([]);
  const [statements, setStatements] = useState([]);
  const [modal, setModal] = useState(null); // 'invoice' | 'bank' | null
  const [preview, setPreview] = useState(null); // { name, url, type }
  const [vendors, setVendors] = useState([]);

  // Active suppliers for the vendor picker — scoped to the selected station
  // (station_id is sent by getPersonsDropDown / the Station-Id header).
  useEffect(() => {
    getPersonsDropDown({ person_type: SUPPLIER_TYPE })
      .then(setVendors) // [{ value: id, label: name }]
      .catch(() => setVendors([]));
  }, [activeStationId]);

  // Uploaded invoices for the selected station.
  const loadInvoices = useCallback(async () => {
    try {
      setUploaded(await getInvoices());
    } catch (err) {
      showToast(err?.message || 'Failed to load invoices', { variant: 'danger' });
      setUploaded([]);
    }
  }, [activeStationId]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const queued = INVOICE_ENTRY_LOG.filter((l) => l.result === 'queued').length;

  const addInvoice = async (payload) => {
    // Upload (incl. any manual line items as invoices_children), then reload.
    await uploadInvoiceApi(payload);
    await loadInvoices();
  };

  const addStatement = ({ file, ...rest }) => {
    setStatements((prev) => [
      {
        id: nextId('bs'),
        ...rest,
        transactions: 0,
        amount: 0,
        fileName: file?.name || '',
        fileUrl: file?.url || '',
        fileType: file?.type || '',
        date: today()
      },
      ...prev
    ]);
  };

  const uploadedColumns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
    { key: 'type', label: 'Type', render: (r) => <StatusBadge value={r.type} map={INVOICE_TYPE} />, exportValue: (r) => r.type },
    { key: 'vendor', label: 'Vendor' },
    { key: 'docType', label: 'Document', render: (r) => <StatusBadge value={r.docType} map={DOC_TYPE} />, exportValue: (r) => r.docType },
    { key: 'amount', label: 'Amount', align: 'right', render: (r) => money(r.amount) },
    { key: 'fileName', label: 'File', sortable: false, render: fileCell(setPreview) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={UPLOAD_STATUS} />, exportValue: (r) => r.status },
    { key: 'date', label: 'Date' }
  ];

  const bankColumns = [
    { key: 'bank', label: 'Bank', render: (r) => <span className="cell-strong">{r.bank}</span> },
    { key: 'period', label: 'Period' },
    { key: 'transactions', label: 'Transactions', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right', render: (r) => money(r.amount) },
    { key: 'fileName', label: 'File', sortable: false, render: fileCell(setPreview) },
    { key: 'date', label: 'Uploaded' }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Fuel · Purchasing"
        title="Invoice Entry"
       
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'summary' && (
        <>
          <div className="row col-4">
            <SummaryCard icon="receipt" tone="teal" label="Uploaded invoices" value={uploaded.length} />
            <SummaryCard icon="clock" tone="blue" label="In queue" value={queued} />
            <SummaryCard icon="bell" tone="red" label="Invoices in error" value={INVOICE_ERRORS.length} />
            <SummaryCard icon="book" tone="green" label="Bank statements" value={statements.length} />
          </div>

          {/* <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">Automated invoice entry</div>
                <div className="card-subtitle">Imports supplier invoices from EDI, email and API into draft purchase invoices.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{enabled ? 'Enabled' : 'Disabled'}</span>
                <Toggle on={enabled} onChange={setEnabled} />
              </div>
            </div>
          </div> */}

          {/* <DataTable
            title="Recent activity"
            columns={logColumns}
            rows={INVOICE_ENTRY_LOG}
            searchKeys={['source', 'invoice', 'detail']}
            selectable={false}
            enableColumnToggle={false}
            emptyText="No recent activity yet."
          /> */}
        </>
      )}

      {tab === 'uploaded' && (
        <DataTable
          title="Uploaded invoices"
          columns={uploadedColumns}
          rows={uploaded}
          searchKeys={['invoiceNumber', 'vendor']}
          searchPlaceholder="Search invoices…"
          selectable={false}
          emptyText="No invoices uploaded yet."
          toolbar={
            canCreate && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal('invoice')}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Upload invoice
              </button>
            )
          }
        />
      )}

      {tab === 'errors' && (
        <DataTable
          title="Invoices with errors"
          subtitle={`${INVOICE_ERRORS.length} need attention`}
          columns={errorColumns}
          rows={INVOICE_ERRORS}
          searchKeys={['invoiceNumber', 'vendor', 'reason']}
          searchPlaceholder="Search errors…"
          selectable={false}
          enableColumnToggle={false}
          emptyText="No invoices with errors."
        />
      )}

      {tab === 'bank' && (
        <DataTable
          title="Bank statements"
          columns={bankColumns}
          rows={statements}
          searchKeys={['bank', 'period']}
          searchPlaceholder="Search statements…"
          selectable={false}
          emptyText="No bank statements uploaded."
          toolbar={
            canCreate && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal('bank')}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                Upload statement
              </button>
            )
          }
        />
      )}

      {modal === 'invoice' && (
        <InvoiceUploadModal vendors={vendors} onClose={() => setModal(null)} onSubmit={addInvoice} />
      )}

      {modal === 'bank' && (
        <FormModal
          title="Upload bank statement"
          fields={bankFields}
          onClose={() => setModal(null)}
          onSubmit={addStatement}
          submitLabel="Upload"
          successMessage="Statement uploaded"
        />
      )}

      {preview && (
        <Modal
          title={preview.name || 'Preview'}
          size="lg"
          onClose={() => setPreview(null)}
          footer={
            <>
              <a className="btn btn-outline" href={preview.url} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
              <button className="btn btn-primary" onClick={() => setPreview(null)}>
                Close
              </button>
            </>
          }
        >
          {isImage(preview) ? (
            <img
              src={preview.url}
              alt={preview.name}
              style={{ maxWidth: '100%', display: 'block', margin: '0 auto', borderRadius: 'var(--radius)' }}
            />
          ) : (
            <iframe
              title={preview.name}
              src={preview.url}
              style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 'var(--radius)' }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
