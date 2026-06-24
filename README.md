# Fuel-Pro — Fuel Station Management

A **multi-tenant fuel-station management** admin app, built as a **React + Vite +
React Router** single-page app. It reuses the original Colorlib SCSS design system
verbatim, so the look (including dark mode) is preserved. Heavy dependencies from
the original template (ECharts, DataTables, Leaflet, jQuery) are gone — charts,
tables, forms, and overlays are implemented natively in React.

## Stack

- **React 18** + **React Router 6** (client-side routing)
- **Vite** dev server / bundler
- **Sass** — the original `v4` SCSS partials, under `src/scss/`
- No Bootstrap, jQuery, Tailwind/PostCSS, or extra state library

## Commands

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the built dist/
```

There are no `lint`/`format` scripts. A Prettier config is present —
`npx prettier --write <files>`; rely on editor diagnostics for linting.

## Backend

The single backend URL lives in `src/api/config.js` (override with
`VITE_API_BASE_URL` in `.env`). All calls go through the `api` client in
`src/api/client.js`, which attaches the `fp_token` Bearer header. Most pages
still render mock data from `src/data/mock/`; resources are migrated to real
endpoints one module at a time (Stations is wired up — see `src/api/stations.js`).

## Auth & roles

Login (`/login`) hits `POST login` (falling back to `POST admin/login`) and
stores `fp_token` + `fp_user` in localStorage; `RequireAuth` redirects to
`/login` when there's no session. Access is role-based (RBAC): routes are wrapped
with `ProtectedRoute perm`, UI is gated with `can()` / `<Can>`, and the sidebar
hides items the role can't view. The permission matrix is in
`src/domain/permissions.js`, roles in `src/domain/roles.js`.

## Pages

| Route | Page |
| --- | --- |
| `/` | Dashboard |
| `/stations`, `/stations/:id` | Station list / details (API-driven) |
| `/sales/new`, `/sales`, `/invoices` | New sale, sales list, invoices |
| `/meter-readings` | Meter readings |
| `/inventory/products` `…/tanks` `…/pumps` `…/stock-entries` `…/stock-transfers` | Inventory |
| `/customers`, `/suppliers`, `/employees` | People |
| `/shifts/start` `…/end` `…/reports` | Shift management |
| `/expenses` | Expenses |
| `/accounting/transactions` `…/journal` `…/profit-loss` `…/balance-sheet` | Accounting |
| `/reports/sales` `…/inventory` `…/expenses` `…/profit` `…/shifts` | Reports |
| `/fuel/atg` `…/sales` `…/pricing` | Fuel ops |
| `/fuel/inventory` `…/reports` `…/settings` | Fuel inventory |
| `/fuel/inventory/purchasing/invoices` `…/audits` `…/audit-config` `…/invoice-entry` | Purchasing & audits |
| `/notifications` | Notifications |
| `/users` `/users/roles` `/users/permissions` | User management |
| `/settings`, `/audit-logs` | Settings, audit logs |
| `/login` `/register` `/forgot-password` | Auth (standalone, no shell) |
| `*` | 404 |

## Structure

```text
src/
├── main.jsx              # Entry — BrowserRouter > AuthProvider > App
├── App.jsx               # Route table (guard('<module>:view', <Page/>))
├── api/                  # config.js (base URL) + client.js + per-resource modules
├── auth/                 # AuthContext, RequireAuth, ProtectedRoute, Can, authApi
├── domain/               # permissions matrix + roles
├── components/
│   ├── AdminLayout.jsx   # Sidebar + Topbar + Footer + <Outlet/> + mobile drawer + rail
│   ├── Sidebar.jsx  Topbar.jsx  Footer.jsx  Icon.jsx  MiniCharts.jsx
│   ├── Modal.jsx  Toggle.jsx  PageHeader.jsx
│   └── crud/             # ResourcePage, DataTable, FormModal, FormField, FilterBar,
│                         #   ConfirmDialog, SummaryCard, StatusBadge, Tabs, Dropdown, …
├── pages/                # Folder-per-page: <Module>/<Page>/index.jsx (+ columns/tabs)
├── data/                 # nav.js (sidebar), options.js, mock/ (demo data)
├── hooks/useTheme.js     # Theme toggle backed by localStorage
└── scss/                 # The original v4 SCSS, reused as-is
```

Theme handling mirrors the original: a pre-paint script in `index.html` applies
the stored/system theme before first render (no flash), and the topbar toggle
flips `data-theme` on `<html>` and persists it.
