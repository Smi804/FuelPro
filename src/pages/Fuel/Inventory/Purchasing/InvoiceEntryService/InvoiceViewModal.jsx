import { Fragment, useEffect, useState } from 'react';
import Modal from '../../../../../components/Modal.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getInvoice } from '../../../../../api/invoices.js';
import { openInvoiceEntriesPdf } from '../../../../../utils/invoiceEntriesPdf.js';
import { INVOICE_TYPE, DOC_TYPE } from '../../../../../data/mock/fuel.js';

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const money = (n) => `$${fmt(n)}`;

const cell = { padding: '8px 10px', fontSize: 13 };

const typeLabel = (v) => INVOICE_TYPE[v]?.label || v || '—';
const docLabel = (v) => DOC_TYPE[v]?.label || v || '—';

export default function InvoiceViewModal({ invoiceId, stationId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getInvoice(invoiceId, { station_id: stationId })
      .then((inv) => {
        if (!cancelled) setInvoice(inv);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load invoice');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId, stationId]);

  const openPdf = () => {
    if (!invoice) return;
    setPdfLoading(true);
    try {
      openInvoiceEntriesPdf(invoice);
    } catch (err) {
      showToast(err?.message || 'Failed to generate invoice PDF', { variant: 'danger' });
    } finally {
      setPdfLoading(false);
    }
  };

  const title = invoice ? `Invoice ${invoice.invoiceNumber}` : 'Invoice';

  return (
    <Modal
      title={title}
      size="lg"
      onClose={onClose}
      footer={
        invoice && (
          <>
            {invoice.fileUrl && (
              <a className="btn btn-outline" href={invoice.fileUrl} target="_blank" rel="noreferrer">
                View file
              </a>
            )}
            <button type="button" className="btn btn-outline" onClick={openPdf} disabled={loading || pdfLoading || !!error}>
              {pdfLoading ? 'Generating…' : 'Print'}
            </button>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </>
        )
      }
    >
      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading invoice…</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
      {invoice && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Invoice {invoice.invoiceNumber}</div>
              {invoice.station_name && (
                <div style={{ fontSize: 13 }}>
                  {invoice.station_name}
                  {invoice.station_code ? ` (${invoice.station_code})` : ''}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: 13 }}>
              <div>Invoice date: {invoice.invoiceDate || '—'}</div>
              <div>Due date: {invoice.dueDate || '—'}</div>
              {invoice.bolNo && <div>BOL No.: {invoice.bolNo}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, marginBottom: 2 }}>Vendor</div>
              <div className="cell-strong">{invoice.vendor || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, marginBottom: 2 }}>Type</div>
              <div>{typeLabel(invoice.type)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, marginBottom: 2 }}>Document</div>
              <div>{docLabel(invoice.docType)}</div>
            </div>
          </div>

          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={cell}>Item</th>
                <th style={{ ...cell, textAlign: 'right' }}>Qty</th>
                <th style={{ ...cell, textAlign: 'right' }}>Rate</th>
                <th style={{ ...cell, textAlign: 'right' }}>Amount</th>
                <th style={{ ...cell, textAlign: 'right' }}>Tax</th>
                <th style={{ ...cell, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.length === 0 ? (
                <tr>
                  <td colSpan={6} style={cell}>
                    No line items.
                  </td>
                </tr>
              ) : (
                invoice.lines.map((line, li) => (
                  <Fragment key={line.id ?? `line-${li}`}>
                    <tr>
                      <td style={cell}>
                        <span className="cell-strong">{line.item_name || `Item #${line.item_id}`}</span>
                        {line.item_sku && <div style={{ fontSize: 11 }}>{line.item_sku}</div>}
                      </td>
                      <td style={{ ...cell, textAlign: 'right' }}>{fmt(line.quantity)}</td>
                      <td style={{ ...cell, textAlign: 'right' }}>{money(line.rate)}</td>
                      <td style={{ ...cell, textAlign: 'right' }}>{money(line.amount)}</td>
                      <td style={{ ...cell, textAlign: 'right' }}>{money(line.sales_tax)}</td>
                      <td style={{ ...cell, textAlign: 'right' }} className="cell-strong">
                        {money(line.total_amount)}
                      </td>
                    </tr>
                    {line.taxes.map((t, ti) => (
                      <tr key={`${line.id}-tax-${ti}`}>
                        <td style={{ ...cell, paddingLeft: 24, fontSize: 12 }} colSpan={2}>
                          ↳ {t.code || `Tax #${t.tax_id}`}
                          {t.description ? ` — ${t.description}` : ''}
                        </td>
                        <td style={{ ...cell, textAlign: 'right', fontSize: 12 }}>{fmt(t.tax_rate)}</td>
                        <td style={cell} />
                        <td style={{ ...cell, textAlign: 'right', fontSize: 12 }}>{money(t.tax_amount)}</td>
                        <td style={cell} />
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ ...cell, textAlign: 'right' }}>
                  Subtotal
                </td>
                <td style={{ ...cell, textAlign: 'right' }}>{money(invoice.subtotal)}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{money(invoice.taxTotal)}</td>
                <td style={cell} />
              </tr>
              <tr>
                <td colSpan={5} style={{ ...cell, textAlign: 'right' }} className="cell-strong">
                  Invoice total
                </td>
                <td style={{ ...cell, textAlign: 'right', fontSize: 15 }} className="cell-strong">
                  {money(invoice.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Modal>
  );
}
