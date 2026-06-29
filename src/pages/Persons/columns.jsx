import StatusBadge from '../../components/crud/StatusBadge.jsx';

export const ACTIVE_STATUS = {
  1: { label: 'Active', cls: 'status-green' },
  0: { label: 'Inactive', cls: 'status-red' }
};

// Person-type badge colors keyed by label (types come from the API).
const TYPE_CLS = {
  Customer: 'status-blue',
  Supplier: 'status-yellow',
  Employee: 'status-green',
  Labor: 'status-blue',
  Vendor: 'status-red'
};

export const STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' }
];

const dash = (v) => (v ? v : <span style={{ color: 'var(--text-muted)' }}>—</span>);
const money = (n) => `$${Number(n || 0).toLocaleString()}`;

export const personColumns = [
  { key: 'name', label: 'Name', render: (r) => <span className="cell-strong">{r.name}</span>, exportValue: (r) => r.name },
  {
    key: 'person_type_label',
    label: 'Type',
    sortable: false,
    render: (r) => <span className={`status ${TYPE_CLS[r.person_type_label] || 'status-blue'}`}>{r.person_type_label}</span>,
    exportValue: (r) => r.person_type_label
  },
  { key: 'phone_no', label: 'Phone', render: (r) => dash(r.phone_no), exportValue: (r) => r.phone_no || '' },
  { key: 'cnic', label: 'ID No', render: (r) => dash(r.cnic), exportValue: (r) => r.cnic || '' },
  {
    key: 'opening_balance',
    label: 'Opening balance',
    align: 'right',
    render: (r) => <span className="cell-strong">{money(r.opening_balance)}</span>,
    exportValue: (r) => Number(r.opening_balance || 0)
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (r) => <StatusBadge value={r.isActive} map={ACTIVE_STATUS} />,
    exportValue: (r) => (r.isActive ? 'Active' : 'Inactive')
  }
];

/**
 * Create/edit fields. The person is scoped to the active station (sent
 * automatically). `person_type_id` drives backend COA/opening-voucher logic;
 * `opening_balance` + `date` are optional (supply both to generate the opening
 * voucher). Person-type options are injected at call time from the API.
 */
export const personFields = ({ personTypes = [] } = {}) => [
  { name: 'person_type_id', label: 'Person type', type: 'select', required: true, options: personTypes, hint: 'Customer / Supplier / Employee / Labor / Vendor' },
  { name: 'name', label: 'Name', required: true },
  { name: 'father_name', label: 'Father / guardian name' },
  { name: 'phone_no', label: 'Phone', required: true },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    validate: (v) => (v && !/^[^@]+@[^@]+\.[^@]+$/.test(v) ? 'Invalid email' : null)
  },
  { name: 'cnic', label: 'ID No', placeholder: '35201-1234567-1' },
  { name: 'address', label: 'Address', span: 2 },
  { name: 'ntn', label: 'NTN' },
  { name: 'gst', label: 'GST' },
  // { name: 'dsl', label: 'DSL' },
  { name: 'opening_balance', label: 'Opening balance', type: 'number', min: 0, defaultValue: 0 },
  { name: 'date', label: 'Opening date', type: 'date', hint: 'With opening balance, generates the opening voucher' },
  // { name: 'cheque_no', label: 'Cheque no.' },
  // { name: 'cheque_date', label: 'Cheque date', type: 'date' }
];
