import ResourcePage from '../../components/crud/ResourcePage.jsx';
import { EXPENSES, EXPENSE_CATEGORIES } from '../../data/mock/operations.js';
import { STATIONS } from '../../data/mock/stations.js';
import { stationIdOptions } from '../../data/options.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category', render: (r) => <span className="chip">{r.category}</span> },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${Number(r.amount).toLocaleString()}`, exportValue: (r) => r.amount }
];

const fields = [
  { name: 'category', label: 'Category', type: 'select', required: true, options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { name: 'stationId', label: 'Station', type: 'select', required: true, options: stationIdOptions },
  { name: 'amount', label: 'Amount ($)', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'description', label: 'Description', required: true, span: 2 },
  { name: 'receiptUrl', label: 'Receipt upload', type: 'file' },
  { name: 'date', label: 'Date', type: 'date', required: true }
];

export default function Expenses() {
  const summary = (rows) => [
    { icon: 'wallet', tone: 'teal', label: 'Total Expenses', value: `$${rows.reduce((s, r) => s + Number(r.amount), 0).toLocaleString()}` },
    { icon: 'receipt', tone: 'blue', label: 'Records', value: rows.length },
    { icon: 'price', tone: 'yellow', label: 'Categories', value: new Set(rows.map((r) => r.category)).size }
  ];
  return (
    <ResourcePage
      perm="expenses"
      pretitle="Finance"
      title="Expenses"
      data={EXPENSES}
      columns={columns}
      searchKeys={['category', 'description']}
      searchPlaceholder="Search expenses…"
      formFields={fields}
      addLabel="Add expense"
      exportName="expenses"
      summary={summary}
      filters={[
        { label: 'Category', key: 'category', options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })) },
        { label: 'Station', key: 'stationId', options: stationIdOptions }
      ]}
    />
  );
}
