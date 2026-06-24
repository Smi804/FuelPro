---
name: fuel-pro-recipes
description: Use when working in the Fuel-Pro React app — adding pages/routes, CRUD list pages, forms, wiring backend APIs, RBAC, navigation, overlays, or looking up file locations and commands.
---

# Fuel-Pro Recipes (React)

React 18 + Vite + react-router. Vanilla SCSS (reused theme), no Bootstrap/jQuery/SPA framework. Pages use mock data in `src/data/mock/`; real endpoints go through `src/api/`. Load this skill only when a task needs these specifics.

## Layout

- `src/main.jsx` — entry: `BrowserRouter` → `AuthProvider` → `App`.
- `src/App.jsx` — routes. Protected area = `<RequireAuth><AdminLayout/></RequireAuth>`; each route wrapped `guard('<module>:view', <Page/>)` (`ProtectedRoute`).
- `src/components/` — `AdminLayout`, `Sidebar`, `Topbar`, `Footer`, `Icon`, `Modal`, `PageHeader`, `MiniCharts`, `Toggle`.
- `src/components/crud/` — `ResourcePage`, `DataTable`, `FormModal`, `FormField`, `FilterBar`, `ConfirmDialog`, `ExportButtons`, `SummaryCard`, `StatusBadge`, `Tabs`, `Dropdown`, `ChartCard`.
- `src/pages/<Module>/<Page>/index.jsx` — folder-per-page; subcomponents (`columns.jsx`, `tabs.jsx`) beside it.
- `src/auth/` — `AuthContext` (`useAuth`: `user`, `can`, `login`, `logout`, `setRole`, `stations`, `activeStationId`), `RequireAuth`, `ProtectedRoute`, `Can`, `authApi`.
- `src/api/` — `config.js` (`API_BASE_URL`, from `VITE_API_BASE_URL`), `client.js` (`api.get/post/put/del`; Bearer `fp_token`; throws on non-2xx + network as `status:0`), one module per resource (e.g. `stations.js`).
- `src/data/nav.js` — `NAV` groups/items; each leaf has `module` (RBAC) matching a route perm.
- `src/domain/` — `roles.js`, `permissions.js` (`PERMISSION_MATRIX`, `can()`), `types.ts`.
- `src/scss/` — partials; `main.scss` entry; `_tokens.scss` theme CSS vars.
- `src/v4/toast.js` — `showToast(msg, { variant })`.

## New page

1. `src/pages/<Module>/<Page>/index.jsx` exporting a default component.
2. Route in `src/App.jsx`: `<Route path="/x" element={guard('<module>:view', <X/>)} />`.
3. NAV leaf in `src/data/nav.js` with `module` = the perm prefix; add icon to `src/components/Icon.jsx` if new.

## CRUD list (mock)

Use `ResourcePage`: `perm`, `title`, `data`, `columns`, `formFields`, `filters`, `summary`, `searchKeys`. It handles add/edit/delete, RBAC gating, summary, filters, export.

## CRUD list (real API)

1. `src/api/<resource>.js`: wrap endpoints with `api.*`, map response→UI shape, normalize `{status:'error'}` to a thrown error (`assertOk`). See `src/api/stations.js`.
2. Page uses `DataTable` in `serverMode` (controlled `page`/`onPageChange`, `sort`/`onSortChange`, `totalRows`, `loading`) + `FormModal` + `ConfirmDialog`. Fetch in a `load()` callback driven by `useEffect`.

## Forms

`FormModal` with a `fields` config. `FormField` types: `text|number|email|tel|date|textarea|select|file|checkbox`. Per-field `required`, `validate(value, values)`, `derive(values)`, `options`, `span`, `accept`, `defaultValue`.

## Overlays & RBAC

- Toast: `import { showToast } from '../../v4/toast.js'`. Modals: `Modal` / `FormModal` / `ConfirmDialog`.
- Permissions: `const { can } = useAuth(); can('sales:create')`. Routes: `<ProtectedRoute perm="x:view">`. Inline: `<Can permission="x:update">`. Edit the matrix in `src/domain/permissions.js`.

## Theme

Colors via CSS custom properties in `_tokens.scss`; never hard-code hex in components.

## Commands

```bash
npm run dev      # Vite dev server on :5173
npm run build
npm run preview
```

No `lint`/`format` scripts; Prettier config exists (`npx prettier --write <files>`). Use editor diagnostics for linting.
