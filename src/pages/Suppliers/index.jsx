import ResourcePage from '../../components/crud/ResourcePage.jsx';
import { SUPPLIERS } from '../../data/mock/people.js';

const columns = [
  { key: 'name', label: 'Supplier', render: (r) => <span className="cell-strong">{r.name}</span> },
  { key: 'contactPerson', label: 'Contact person' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  {
    key: 'outstandingBalance',
    label: 'Outstanding',
    align: 'right',
    render: (r) => (
      <span className="cell-strong" style={{ color: r.outstandingBalance > 0 ? 'var(--red)' : 'var(--green)' }}>
        ${Number(r.outstandingBalance).toLocaleString()}
      </span>
    ),
    exportValue: (r) => r.outstandingBalance
  }
];

const fields = [
  { name: 'name', label: 'Supplier name', required: true, span: 2 },
  { name: 'contactPerson', label: 'Contact person', required: true },
  { name: 'phone', label: 'Phone', required: true },
  { name: 'address', label: 'Address', span: 2 },
  { name: 'outstandingBalance', label: 'Outstanding balance', type: 'number', min: 0, defaultValue: 0 }
];

export default function Suppliers() {
  const summary = (rows) => [
    { icon: 'truck', tone: 'teal', label: 'Suppliers', value: rows.length },
    { icon: 'price', tone: 'red', label: 'Total Outstanding', value: `$${rows.reduce((s, r) => s + Number(r.outstandingBalance), 0).toLocaleString()}` },
    { icon: 'wallet', tone: 'green', label: 'Settled', value: rows.filter((r) => Number(r.outstandingBalance) === 0).length }
  ];
  return (
    <ResourcePage
      perm="suppliers"
      pretitle="People"
      title="Suppliers"
      data={SUPPLIERS}
      columns={columns}
      searchKeys={['name', 'contactPerson', 'phone']}
      searchPlaceholder="Search suppliers…"
      formFields={fields}
      addLabel="Add supplier"
      exportName="suppliers"
      summary={summary}
    />
  );
}
