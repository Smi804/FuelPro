import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getInvoice } from '../api/invoices.js';
import { INVOICE_TYPE, DOC_TYPE } from '../data/mock/fuel.js';

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const money = (n) => `$${fmt(n)}`;

const typeLabel = (v) => INVOICE_TYPE[v]?.label || v || '—';
const docLabel = (v) => DOC_TYPE[v]?.label || v || '—';

/** Build a PDF from a mapped getInvoice payload and open it in a new tab. */
export function openInvoiceEntriesPdf(invoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = 18;

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`Invoice ${invoice.invoiceNumber}`, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  if (invoice.station_name) {
    doc.text(`${invoice.station_name}${invoice.station_code ? ` (${invoice.station_code})` : ''}`, margin, y);
    y += 5;
  }

  const rightX = 196;
  const meta = [
    `Invoice date: ${invoice.invoiceDate || '—'}`,
    `Due date: ${invoice.dueDate || '—'}`,
    invoice.bolNo ? `BOL No.: ${invoice.bolNo}` : null
  ].filter(Boolean);
  meta.forEach((line, i) => {
    doc.text(line, rightX, 18 + i * 5, { align: 'right' });
  });

  y += 4;
  doc.text(`Vendor: ${invoice.vendor || '—'}`, margin, y);
  y += 5;
  doc.text(`Type: ${typeLabel(invoice.type)}    Document: ${docLabel(invoice.docType)}`, margin, y);
  y += 8;

  const rows = [];
  (invoice.lines || []).forEach((line) => {
    rows.push([
      line.item_name || `Item #${line.item_id}`,
      fmt(line.quantity),
      money(line.rate),
      money(line.amount),
      money(line.sales_tax),
      money(line.total_amount)
    ]);
    (line.taxes || []).forEach((t) => {
      rows.push([
        `    ${t.code || `Tax #${t.tax_id}`}${t.description ? ` — ${t.description}` : ''}`,
        '',
        fmt(t.tax_rate),
        '',
        money(t.tax_amount),
        ''
      ]);
    });
  });

  if (!rows.length) {
    rows.push(['No line items.', '', '', '', '', '']);
  }

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qty', 'Rate', 'Amount', 'Tax', 'Total']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 62 },
      1: { halign: 'right', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'right', cellWidth: 26 }
    },
    margin: { left: margin, right: margin }
  });

  const finalY = (doc.lastAutoTable?.finalY ?? y) + 8;
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal', margin + 100, finalY);
  doc.text(money(invoice.subtotal), rightX, finalY, { align: 'right' });
  doc.text('Tax total', margin + 100, finalY + 6);
  doc.text(money(invoice.taxTotal), rightX, finalY + 6, { align: 'right' });
  doc.setFont(undefined, 'bold');
  doc.text('Invoice total', margin + 100, finalY + 14);
  doc.text(money(invoice.amount), rightX, finalY + 14, { align: 'right' });

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error('Pop-up blocked. Allow pop-ups to open the invoice PDF.');
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Fetch getInvoice then open the entries PDF in a new tab. */
export async function printInvoiceEntriesPdf(invoiceId, stationId) {
  const invoice = await getInvoice(invoiceId, { station_id: stationId });
  openInvoiceEntriesPdf(invoice);
  return invoice;
}
