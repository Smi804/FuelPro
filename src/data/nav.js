// Role-aware navigation model for the Fuel Station Management System.
// Each leaf / child carries a `module` key used by RBAC to decide visibility
// (the sidebar shows an item only when the user has `${module}:view`).
export const NAV = [
  {
    label: 'Overview',
    items: [{ key: 'dashboard', to: '/', text: 'Dashboard', icon: 'dashboard', module: 'dashboard' }]
  },
  {
    label: 'Operations',
    items: [
      {
        text: 'Stations',
        icon: 'fuel',
        children: [
          { key: 'station-list', to: '/stations', text: 'Station List', module: 'stations' },
          { key: 'station-details', to: '/stations/current', text: 'Station Details', module: 'stations' }
        ]
      },
      {
        text: 'Sales',
        icon: 'receipt',
        children: [
          { key: 'new-sale', to: '/sales/new', text: 'New Sale', module: 'sales' },
          { key: 'sales-list', to: '/sales', text: 'Sales List', module: 'sales' },
          { key: 'invoices', to: '/invoices', text: 'Invoices', module: 'invoices' },
          { key: 'meter-readings', to: '/meter-readings', text: 'Meter Readings', module: 'meter_readings' }
        ]
      },
      // {
      //   text: 'Inventory',
      //   icon: 'inventory',
      //   children: [
      //     { key: 'products', to: '/inventory/products', text: 'Fuel Products', module: 'products' },
      //     { key: 'tanks', to: '/inventory/tanks', text: 'Tanks', module: 'tanks' },
      //     { key: 'pumps', to: '/inventory/pumps', text: 'Pumps', module: 'pumps' },
      //     { key: 'stock-entries', to: '/inventory/stock-entries', text: 'Stock Entries', module: 'stock_entries' },
      //     { key: 'stock-transfers', to: '/inventory/stock-transfers', text: 'Stock Transfers', module: 'stock_transfers' }
      //   ]
      // },
      {
        text: 'Shift Management',
        icon: 'clock',
        children: [
          { key: 'shift-start', to: '/shifts/start', text: 'Start Shift', module: 'shifts' },
          { key: 'shift-end', to: '/shifts/end', text: 'End Shift', module: 'shifts' },
          { key: 'shift-reports', to: '/shifts/reports', text: 'Shift Reports', module: 'shifts' }
        ]
      }
    ]
  },
  {
    label: 'Catalog',
    items: [
      { key: 'items', to: '/items', text: 'Items', icon: 'inventory', module: 'items' },
      { key: 'brands', to: '/brands', text: 'Brands', icon: 'tag', module: 'brands' }
    ]
  },
  {
    label: 'Fuel',
    items: [
      { key: 'fuel-atg', to: '/fuel/atg', text: 'ATG Management', icon: 'inventory', module: 'atg' },
      { key: 'fuel-sales', to: '/fuel/sales', text: 'Fuel Sales', icon: 'receipt', module: 'fuel_sales' },
      { key: 'fuel-pricing', to: '/fuel/pricing', text: 'Fuel Pricing', icon: 'price', module: 'fuel_pricing' },
      {
        text: 'Fuel Inventory',
        icon: 'fuel',
        children: [
          { key: 'fuel-inv-overview', to: '/fuel/inventory', text: 'Overview', module: 'fuel_inventory' },
          {
            text: 'Purchasing',
            children: [
              { key: 'fuel-pi', to: '/fuel/inventory/purchasing/invoices', text: 'Purchase Invoices', module: 'purchase_invoices' },
              { key: 'fuel-audits', to: '/fuel/inventory/purchasing/audits', text: 'Fuel Audits', module: 'fuel_audits' },
              { key: 'fuel-audit-config', to: '/fuel/inventory/purchasing/audit-config', text: 'Fuel Audit Config', module: 'fuel_audit_config' },
              { key: 'fuel-ies', to: '/fuel/inventory/purchasing/invoice-entry', text: 'Invoice Entry Service', module: 'invoice_entry_service' }
            ]
          },
          { key: 'fuel-inv-reports', to: '/fuel/inventory/reports', text: 'Reports', module: 'fuel_inventory' },
          { key: 'fuel-inv-settings', to: '/fuel/inventory/settings', text: 'Settings', module: 'fuel_inventory' }
        ]
      }
    ]
  },
  {
    label: 'People',
    items: [
      { key: 'customers', to: '/customers', text: 'Customers', icon: 'users', module: 'customers' },
      { key: 'suppliers', to: '/suppliers', text: 'Suppliers', icon: 'truck', module: 'suppliers' },
      { key: 'employees', to: '/employees', text: 'Employees', icon: 'profile', module: 'employees' }
    ]
  },
  {
    label: 'Finance',
    items: [
      { key: 'expenses', to: '/expenses', text: 'Expenses', icon: 'wallet', module: 'expenses' },
      {
        text: 'Accounting',
        icon: 'book',
        children: [
          { key: 'transactions', to: '/accounting/transactions', text: 'Transactions', module: 'accounting' },
          { key: 'journal', to: '/accounting/journal', text: 'Journal Entries', module: 'accounting' },
          { key: 'profit-loss', to: '/accounting/profit-loss', text: 'Profit & Loss', module: 'accounting' },
          { key: 'balance-sheet', to: '/accounting/balance-sheet', text: 'Balance Sheet', module: 'accounting' }
        ]
      }
    ]
  },
  {
    label: 'Insights',
    items: [
      {
        text: 'Reports',
        icon: 'charts',
        children: [
          { key: 'rep-sales', to: '/reports/sales', text: 'Sales Reports', module: 'reports' },
          { key: 'rep-inventory', to: '/reports/inventory', text: 'Inventory Reports', module: 'reports' },
          { key: 'rep-expenses', to: '/reports/expenses', text: 'Expense Reports', module: 'reports' },
          { key: 'rep-profit', to: '/reports/profit', text: 'Profit Reports', module: 'reports' },
          { key: 'rep-shifts', to: '/reports/shifts', text: 'Shift Reports', module: 'reports' }
        ]
      },
      { key: 'notifications', to: '/notifications', text: 'Notifications', icon: 'bell', module: 'notifications' }
    ]
  },
  {
    label: 'Administration',
    items: [
      {
        text: 'User Management',
        icon: 'users',
        children: [
          { key: 'users', to: '/users', text: 'Users', module: 'users' },
          { key: 'roles', to: '/users/roles', text: 'Roles', module: 'roles' },
          { key: 'permissions', to: '/users/permissions', text: 'Permissions', module: 'permissions' }
        ]
      },
      { key: 'settings', to: '/settings', text: 'Settings', icon: 'settings', module: 'settings' },
      { key: 'audit-logs', to: '/audit-logs', text: 'Audit Logs', icon: 'shield', module: 'audit_logs' }
    ]
  }
];
