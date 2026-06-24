import PageHeader from '../../../components/PageHeader.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import { BALANCE_SHEET } from '../../../data/mock/accounting.js';

const sum = (rows) => rows.reduce((s, [, v]) => s + v, 0);

function Block({ title, rows, total }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="table-responsive">
        <table className="table">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td style={{ textAlign: 'right' }}>${value.toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td className="cell-strong">Total {title.toLowerCase()}</td>
              <td className="cell-strong" style={{ textAlign: 'right' }}>${total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BalanceSheet() {
  const assets = sum(BALANCE_SHEET.assets);
  const liabilities = sum(BALANCE_SHEET.liabilities);
  const equity = sum(BALANCE_SHEET.equity);

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Accounting"
        title="Balance Sheet"
        actions={<button className="btn btn-outline" onClick={() => window.print()}>Print / PDF</button>}
      />
      <div className="row col-3">
        <SummaryCard icon="inventory" tone="teal" label="Total Assets" value={`$${assets.toLocaleString()}`} />
        <SummaryCard icon="price" tone="red" label="Total Liabilities" value={`$${liabilities.toLocaleString()}`} />
        <SummaryCard icon="wallet" tone="green" label="Total Equity" value={`$${equity.toLocaleString()}`} />
      </div>
      <div className="row col-3">
        <Block title="Assets" rows={BALANCE_SHEET.assets} total={assets} />
        <Block title="Liabilities" rows={BALANCE_SHEET.liabilities} total={liabilities} />
        <Block title="Equity" rows={BALANCE_SHEET.equity} total={equity} />
      </div>
      <div className="card">
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span className="cell-strong">Liabilities + Equity</span>
          <span className="cell-strong" style={{ color: liabilities + equity === assets ? 'var(--green)' : 'var(--red)' }}>
            ${(liabilities + equity).toLocaleString()} {liabilities + equity === assets ? '· Balanced' : '· Out of balance'}
          </span>
        </div>
      </div>
    </div>
  );
}
