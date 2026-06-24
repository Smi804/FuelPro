import PageHeader from '../../../components/PageHeader.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import { PROFIT_LOSS } from '../../../data/mock/accounting.js';

const sum = (rows) => rows.reduce((s, [, v]) => s + v, 0);

function Section({ title, rows, total, strong }) {
  return (
    <>
      <tr>
        <td colSpan={2} className="cell-strong" style={{ paddingTop: 16, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11.5, letterSpacing: 0.3 }}>
          {title}
        </td>
      </tr>
      {rows.map(([label, value]) => (
        <tr key={label}>
          <td>{label}</td>
          <td style={{ textAlign: 'right' }}>${value.toLocaleString()}</td>
        </tr>
      ))}
      <tr>
        <td className="cell-strong">{title} total</td>
        <td className="cell-strong" style={{ textAlign: 'right', color: strong }}>${total.toLocaleString()}</td>
      </tr>
    </>
  );
}

export default function ProfitLoss() {
  const revenue = sum(PROFIT_LOSS.revenue);
  const cogs = sum(PROFIT_LOSS.cogs);
  const opex = sum(PROFIT_LOSS.operatingExpenses);
  const gross = revenue - cogs;
  const net = gross - opex;

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Accounting"
        title="Profit & Loss"
        actions={<button className="btn btn-outline" onClick={() => window.print()}>Print / PDF</button>}
      />
      <div className="row col-3">
        <SummaryCard icon="receipt" tone="teal" label="Revenue" value={`$${revenue.toLocaleString()}`} />
        <SummaryCard icon="book" tone="blue" label="Gross Profit" value={`$${gross.toLocaleString()}`} />
        <SummaryCard icon="wallet" tone="green" label="Net Profit" value={`$${net.toLocaleString()}`} change={`${Math.round((net / revenue) * 100)}% margin`} changeDir="up" />
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Statement · June 2026</div></div>
        <div className="table-responsive">
          <table className="table">
            <tbody>
              <Section title="Revenue" rows={PROFIT_LOSS.revenue} total={revenue} />
              <Section title="Cost of goods sold" rows={PROFIT_LOSS.cogs} total={cogs} />
              <tr>
                <td className="cell-strong" style={{ fontSize: 14 }}>Gross profit</td>
                <td className="cell-strong" style={{ textAlign: 'right', fontSize: 14 }}>${gross.toLocaleString()}</td>
              </tr>
              <Section title="Operating expenses" rows={PROFIT_LOSS.operatingExpenses} total={opex} />
              <tr>
                <td className="cell-strong" style={{ fontSize: 15 }}>Net profit</td>
                <td className="cell-strong" style={{ textAlign: 'right', fontSize: 15, color: 'var(--green)' }}>${net.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
