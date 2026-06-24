export const TRANSACTIONS = [
  { id: 't_1', date: '2026-06-23', account: 'Cash', description: 'Fuel sales — Riverside', type: 'debit', amount: 3210, reference: 'INV-10231..35' },
  { id: 't_2', date: '2026-06-23', account: 'Accounts Receivable', description: 'Credit sale — Acme Logistics', type: 'debit', amount: 186, reference: 'INV-10232' },
  { id: 't_3', date: '2026-06-22', account: 'Inventory', description: 'Stock purchase — BalticOil', type: 'debit', amount: 16080, reference: 'PO-5521' },
  { id: 't_4', date: '2026-06-22', account: 'Accounts Payable', description: 'Supplier credit — BalticOil', type: 'credit', amount: 16080, reference: 'PO-5521' },
  { id: 't_5', date: '2026-06-20', account: 'Utilities Expense', description: 'Electricity — June', type: 'debit', amount: 1240, reference: 'EXP-001' },
  { id: 't_6', date: '2026-06-15', account: 'Salaries Expense', description: 'Payroll — first half', type: 'debit', amount: 8400, reference: 'EXP-003' },
  { id: 't_7', date: '2026-06-23', account: 'Sales Revenue', description: 'Fuel sales recognized', type: 'credit', amount: 3396, reference: 'DAY-0623' }
];

export const JOURNAL_ENTRIES = [
  { id: 'je_1', date: '2026-06-22', reference: 'PO-5521', narration: 'Fuel stock purchased on credit from BalticOil', lines: [{ account: 'Inventory', debit: 16080, credit: 0 }, { account: 'Accounts Payable', debit: 0, credit: 16080 }] },
  { id: 'je_2', date: '2026-06-23', reference: 'DAY-0623', narration: 'Daily fuel sales (cash + credit)', lines: [{ account: 'Cash', debit: 3210, credit: 0 }, { account: 'Accounts Receivable', debit: 186, credit: 0 }, { account: 'Sales Revenue', debit: 0, credit: 3396 }] },
  { id: 'je_3', date: '2026-06-20', reference: 'EXP-001', narration: 'Electricity bill paid', lines: [{ account: 'Utilities Expense', debit: 1240, credit: 0 }, { account: 'Cash', debit: 0, credit: 1240 }] }
];

// Simplified P&L and Balance Sheet figures (period: June 2026).
export const PROFIT_LOSS = {
  revenue: [
    ['Fuel sales', 184200],
    ['Convenience store', 21400],
    ['Car wash & services', 9800]
  ],
  cogs: [
    ['Fuel purchases', 142600],
    ['Store goods', 14100]
  ],
  operatingExpenses: [
    ['Salaries', 28600],
    ['Utilities', 4200],
    ['Maintenance', 3100],
    ['Marketing', 1800],
    ['Other', 2400]
  ]
};

export const BALANCE_SHEET = {
  assets: [
    ['Cash & equivalents', 86400],
    ['Accounts receivable', 30060],
    ['Fuel inventory', 98200],
    ['Property & equipment', 412000]
  ],
  liabilities: [
    ['Accounts payable', 71100],
    ['Short-term loans', 40000],
    ['Taxes payable', 18600]
  ],
  equity: [
    ['Owner capital', 400000],
    ['Retained earnings', 96960]
  ]
};
