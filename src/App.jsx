import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import RequireAuth from './auth/RequireAuth.jsx';

import Dashboard from './pages/Dashboard/index.jsx';
import StationList from './pages/Stations/StationList/index.jsx';
import StationDetails from './pages/Stations/StationDetails/index.jsx';
import NewSale from './pages/Sales/NewSale/index.jsx';
import SalesList from './pages/Sales/SalesList/index.jsx';
import Invoices from './pages/Sales/Invoices/index.jsx';
import MeterReadings from './pages/MeterReadings/index.jsx';
import FuelProducts from './pages/Inventory/FuelProducts/index.jsx';
import Tanks from './pages/Inventory/Tanks/index.jsx';
import Pumps from './pages/Inventory/Pumps/index.jsx';
import StockEntries from './pages/Inventory/StockEntries/index.jsx';
import StockTransfers from './pages/Inventory/StockTransfers/index.jsx';
import Customers from './pages/Customers/index.jsx';
import Suppliers from './pages/Suppliers/index.jsx';
import Employees from './pages/Employees/index.jsx';
import StartShift from './pages/Shifts/StartShift/index.jsx';
import EndShift from './pages/Shifts/EndShift/index.jsx';
import ShiftReports from './pages/Shifts/ShiftReports/index.jsx';
import Expenses from './pages/Expenses/index.jsx';
import Transactions from './pages/Accounting/Transactions/index.jsx';
import JournalEntries from './pages/Accounting/JournalEntries/index.jsx';
import ProfitLoss from './pages/Accounting/ProfitLoss/index.jsx';
import BalanceSheet from './pages/Accounting/BalanceSheet/index.jsx';
import SalesReports from './pages/Reports/SalesReports/index.jsx';
import InventoryReports from './pages/Reports/InventoryReports/index.jsx';
import ExpenseReports from './pages/Reports/ExpenseReports/index.jsx';
import ProfitReports from './pages/Reports/ProfitReports/index.jsx';
import ShiftReportsPage from './pages/Reports/ShiftReports/index.jsx';
import Notifications from './pages/Notifications/index.jsx';
import Users from './pages/UserManagement/Users/index.jsx';
import Roles from './pages/UserManagement/Roles/index.jsx';
import Permissions from './pages/UserManagement/Permissions/index.jsx';
import Settings from './pages/Settings/index.jsx';
import AuditLogs from './pages/AuditLogs/index.jsx';

import AtgManagement from './pages/Fuel/AtgManagement/index.jsx';
import FuelSales from './pages/Fuel/FuelSales/index.jsx';
import FuelPricing from './pages/Fuel/FuelPricing/index.jsx';
import FuelInventoryOverview from './pages/Fuel/Inventory/Overview/index.jsx';
import FuelInventoryReports from './pages/Fuel/Inventory/Reports/index.jsx';
import FuelInventorySettings from './pages/Fuel/Inventory/Settings/index.jsx';
import PurchaseInvoices from './pages/Fuel/Inventory/Purchasing/PurchaseInvoices/index.jsx';
import FuelAudits from './pages/Fuel/Inventory/Purchasing/FuelAudits/index.jsx';
import FuelAuditConfig from './pages/Fuel/Inventory/Purchasing/FuelAuditConfig/index.jsx';
import InvoiceEntryService from './pages/Fuel/Inventory/Purchasing/InvoiceEntryService/index.jsx';

import Login from './pages/Auth/Login/index.jsx';
import Register from './pages/Auth/Register/index.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword/index.jsx';
import NotFound from './pages/NotFound.jsx';

const guard = (perm, element) => <ProtectedRoute perm={perm}>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={guard('dashboard:view', <Dashboard />)} />

        <Route path="/stations" element={guard('stations:view', <StationList />)} />
        <Route path="/stations/:id" element={guard('stations:view', <StationDetails />)} />

        <Route path="/sales/new" element={guard('sales:view', <NewSale />)} />
        <Route path="/sales" element={guard('sales:view', <SalesList />)} />
        <Route path="/invoices" element={guard('invoices:view', <Invoices />)} />
        <Route path="/meter-readings" element={guard('meter_readings:view', <MeterReadings />)} />

        <Route path="/inventory/products" element={guard('products:view', <FuelProducts />)} />
        <Route path="/inventory/tanks" element={guard('tanks:view', <Tanks />)} />
        <Route path="/inventory/pumps" element={guard('pumps:view', <Pumps />)} />
        <Route path="/inventory/stock-entries" element={guard('stock_entries:view', <StockEntries />)} />
        <Route path="/inventory/stock-transfers" element={guard('stock_transfers:view', <StockTransfers />)} />

        <Route path="/customers" element={guard('customers:view', <Customers />)} />
        <Route path="/suppliers" element={guard('suppliers:view', <Suppliers />)} />
        <Route path="/employees" element={guard('employees:view', <Employees />)} />

        <Route path="/shifts/start" element={guard('shifts:view', <StartShift />)} />
        <Route path="/shifts/end" element={guard('shifts:view', <EndShift />)} />
        <Route path="/shifts/reports" element={guard('shifts:view', <ShiftReports />)} />

        <Route path="/expenses" element={guard('expenses:view', <Expenses />)} />

        <Route path="/accounting/transactions" element={guard('accounting:view', <Transactions />)} />
        <Route path="/accounting/journal" element={guard('accounting:view', <JournalEntries />)} />
        <Route path="/accounting/profit-loss" element={guard('accounting:view', <ProfitLoss />)} />
        <Route path="/accounting/balance-sheet" element={guard('accounting:view', <BalanceSheet />)} />

        <Route path="/reports/sales" element={guard('reports:view', <SalesReports />)} />
        <Route path="/reports/inventory" element={guard('reports:view', <InventoryReports />)} />
        <Route path="/reports/expenses" element={guard('reports:view', <ExpenseReports />)} />
        <Route path="/reports/profit" element={guard('reports:view', <ProfitReports />)} />
        <Route path="/reports/shifts" element={guard('reports:view', <ShiftReportsPage />)} />

        <Route path="/notifications" element={guard('notifications:view', <Notifications />)} />

        <Route path="/users" element={guard('users:view', <Users />)} />
        <Route path="/users/roles" element={guard('roles:view', <Roles />)} />
        <Route path="/users/permissions" element={guard('permissions:view', <Permissions />)} />

        <Route path="/settings" element={guard('settings:view', <Settings />)} />
        <Route path="/audit-logs" element={guard('audit_logs:view', <AuditLogs />)} />

        <Route path="/fuel/atg" element={guard('atg:view', <AtgManagement />)} />
        <Route path="/fuel/sales" element={guard('fuel_sales:view', <FuelSales />)} />
        <Route path="/fuel/pricing" element={guard('fuel_pricing:view', <FuelPricing />)} />
        <Route path="/fuel/inventory" element={guard('fuel_inventory:view', <FuelInventoryOverview />)} />
        <Route path="/fuel/inventory/reports" element={guard('fuel_inventory:view', <FuelInventoryReports />)} />
        <Route path="/fuel/inventory/settings" element={guard('fuel_inventory:view', <FuelInventorySettings />)} />
        <Route path="/fuel/inventory/purchasing/invoices" element={guard('purchase_invoices:view', <PurchaseInvoices />)} />
        <Route path="/fuel/inventory/purchasing/audits" element={guard('fuel_audits:view', <FuelAudits />)} />
        <Route path="/fuel/inventory/purchasing/audit-config" element={guard('fuel_audit_config:view', <FuelAuditConfig />)} />
        <Route path="/fuel/inventory/purchasing/invoice-entry" element={guard('invoice_entry_service:view', <InvoiceEntryService />)} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
