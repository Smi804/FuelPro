import ResourcePage from '../../components/crud/ResourcePage.jsx';
import { CUSTOMERS } from '../../data/mock/people.js';

const columns = [
  { key: 'name', label: 'Name', render: (r) => <span className="cell-strong">{r.name}</span> },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone' },
  { key: 'creditLimit', label: 'Credit limit', align: 'right', render: (r) => `$${Number(r.creditLimit).toLocaleString()}` },
  {
    key: 'currentBalance',
    label: 'Balance',
    align: 'right',
    render: (r) => (
      <span style={{ color: r.currentBalance > r.creditLimit ? 'var(--red)' : 'var(--text)' }} className="cell-strong">
        ${Number(r.currentBalance).toLocaleString()}
      </span>
    ),
    exportValue: (r) => r.currentBalance
  }
];

const fields = [
  { name: 'name', label: 'Customer name', required: true },
  { name: 'company', label: 'Company' },
  { name: 'phone', label: 'Phone', required: true },
  { name: 'creditLimit', label: 'Credit limit', type: 'number', min: 0, defaultValue: 0 },
  { name: 'currentBalance', label: 'Current balance', type: 'number', min: 0, defaultValue: 0 }
];

export default function Customers() {
  const summary = (rows) => [
    { icon: 'users', tone: 'teal', label: 'Customers', value: rows.length },
    { icon: 'tag', tone: 'yellow', label: 'Total Credit Limit', value: `$${rows.reduce((s, r) => s + Number(r.creditLimit), 0).toLocaleString()}` },
    { icon: 'price', tone: 'red', label: 'Outstanding Balance', value: `$${rows.reduce((s, r) => s + Number(r.currentBalance), 0).toLocaleString()}` }
  ];
  return (
    <ResourcePage
      perm="customers"
      pretitle="People"
      title="Customers"
      data={CUSTOMERS}
      columns={columns}
      searchKeys={['name', 'company', 'phone']}
      searchPlaceholder="Search customers…"
      formFields={fields}
      addLabel="Add customer"
      exportName="customers"
      summary={summary}
    />
  );
}
