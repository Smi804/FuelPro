import PageHeader from '../../../components/PageHeader.jsx';
import Can from '../../../auth/Can.jsx';
import { JOURNAL_ENTRIES } from '../../../data/mock/accounting.js';

export default function JournalEntries() {
  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Accounting"
        title="Journal Entries"
        actions={
          <Can perm="accounting:create">
            <button className="btn btn-primary">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 8h8M8 4v8" />
              </svg>
              New entry
            </button>
          </Can>
        }
      />
      <div className="row col-1">
        {JOURNAL_ENTRIES.map((je) => {
          const totalDebit = je.lines.reduce((s, l) => s + l.debit, 0);
          const totalCredit = je.lines.reduce((s, l) => s + l.credit, 0);
          return (
            <div className="card" key={je.id}>
              <div className="card-header">
                <div>
                  <div className="card-title">{je.reference}</div>
                  <div className="card-subtitle">{je.narration}</div>
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{je.date}</span>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th style={{ textAlign: 'right' }}>Debit</th>
                      <th style={{ textAlign: 'right' }}>Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {je.lines.map((l, i) => (
                      <tr key={i}>
                        <td>{l.account}</td>
                        <td style={{ textAlign: 'right' }}>{l.debit ? `$${l.debit.toLocaleString()}` : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{l.credit ? `$${l.credit.toLocaleString()}` : '—'}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="cell-strong">Total</td>
                      <td className="cell-strong" style={{ textAlign: 'right' }}>${totalDebit.toLocaleString()}</td>
                      <td className="cell-strong" style={{ textAlign: 'right' }}>${totalCredit.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
