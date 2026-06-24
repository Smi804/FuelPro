import { showToast } from '../../v4/toast.js';

function toCsv(columns, rows) {
  const head = columns.map((c) => `"${c.label}"`).join(',');
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const raw = c.exportValue ? c.exportValue(r) : r[c.key];
          return `"${String(raw ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');
  return `${head}\n${body}`;
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Reusable export toolbar: Excel (CSV), PDF (print-to-PDF) and Print.
 * `columns`/`rows` drive the CSV; PDF & Print use the browser print dialog so no
 * heavy library is pulled in.
 */
export default function ExportButtons({ columns = [], rows = [], filename = 'export' }) {
  const exportCsv = () => {
    download(`${filename}.csv`, toCsv(columns, rows), 'text/csv;charset=utf-8;');
    showToast('Exported to Excel (CSV)', { variant: 'success' });
  };
  const print = () => window.print();

  return (
    <div className="page-actions">
      <button className="btn btn-outline btn-sm" type="button" onClick={exportCsv}>
        Excel
      </button>
      <button className="btn btn-outline btn-sm" type="button" onClick={print}>
        PDF
      </button>
      <button className="btn btn-outline btn-sm" type="button" onClick={print}>
        Print
      </button>
    </div>
  );
}
