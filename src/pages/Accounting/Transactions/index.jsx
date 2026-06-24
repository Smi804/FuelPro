import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import Can from '../../../auth/Can.jsx';
import { TRANSACTIONS } from '../../../data/mock/accounting.js';

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'reference', label: 'Reference', render: (r) => <span className="cell-strong">{r.reference}</span> },
  { key: 'account', label: 'Account' },
  { key: 'description', label: 'Description' },
  { key: 'type', label: 'Type', render: (r) => <span className={'chip ' + (r.type === 'debit' ? 'chip-blue' : 'chip-green')}>{r.type}</span>, exportValue: (r) => r.type },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${Number(r.amount).toLocaleString()}`, exportValue: (r) => r.amount }
];

export default function Transactions() {
  const debit = TRANSACTIONS.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const credit = TRANSACTIONS.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Accounting"
        title="Transactions"
        actions={
          <Can perm="accounting:export">
            <ExportButtons columns={columns} rows={TRANSACTIONS} filename="transactions" />
          </Can>
        }
      />
      <div className="row col-3">
        <SummaryCard icon="book" tone="teal" label="Entries" value={TRANSACTIONS.length} />
        <SummaryCard icon="wallet" tone="blue" label="Total Debits" value={`$${debit.toLocaleString()}`} />
        <SummaryCard icon="price" tone="green" label="Total Credits" value={`$${credit.toLocaleString()}`} />
      </div>
      <DataTable title="Ledger transactions" columns={columns} rows={TRANSACTIONS} searchKeys={['account', 'description', 'reference']} searchPlaceholder="Search transactions…" selectable={false} />
    </div>
  );
}
