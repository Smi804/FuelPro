# AGENTS.md

Cross-tool agent instructions for Fuel-Pro. Counterparts: [CLAUDE.md](CLAUDE.md) (Claude Code), [.cursor/rules/project.mdc](.cursor/rules/project.mdc) (Cursor). Content overlaps intentionally.

## What this is

**Fuel-Pro** — a multi-tenant fuel-station management admin app. **React 18 + Vite + React Router 6**, styled with the original Colorlib **SCSS** design system (reused as-is, dark mode included). No Bootstrap, jQuery, Tailwind/PostCSS, or extra state library. Pages render **mock data** from `src/data/mock/`; real backend endpoints go through `src/api/`.

## Setup

```bash
npm install
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve built dist/
```

No `lint`/`format` scripts exist; a Prettier config is present (`npx prettier --write <files>`). Use editor diagnostics for linting.

## Architecture

- **Entry** [src/main.jsx](src/main.jsx): `BrowserRouter → AuthProvider → App`.
- **Routes** [src/App.jsx](src/App.jsx): protected pages under `<RequireAuth><AdminLayout/></RequireAuth>`, each wrapped `guard('<module>:view', <Page/>)`. Auth pages render outside the shell.
- **Folder-per-page**: `src/pages/<Module>/<Page>/index.jsx` with subcomponents (`columns.jsx`, `tabs.jsx`) beside it.
- **Shell** [src/components/AdminLayout.jsx](src/components/AdminLayout.jsx): `Sidebar` + `Topbar` + `Footer` + `<Outlet/>`, mobile drawer + desktop rail toggle.
- **Reusable CRUD UI** [src/components/crud/](src/components/crud/): `ResourcePage`, `DataTable` (client + `serverMode`), `FormModal`, `FormField`, `FilterBar`, `ConfirmDialog`, `SummaryCard`, `StatusBadge`, `Tabs`, `Dropdown`, `ExportButtons`, `ChartCard`; plus `Modal`, `PageHeader`, `Icon`, `MiniCharts`.
- **API layer** [src/api/](src/api/): `config.js` (only backend URL — `API_BASE_URL` from `VITE_API_BASE_URL`); `client.js` (`api.get/post/put/patch/del`, Bearer `fp_token`, throws on non-2xx / network `status:0`); one module per resource (e.g. `stations.js`).
- **Auth + RBAC** [src/auth/](src/auth/): `AuthContext` (`useAuth`), `RequireAuth`, `ProtectedRoute`, `Can`, `authApi`. Matrix in [src/domain/permissions.js](src/domain/permissions.js), roles in [src/domain/roles.js](src/domain/roles.js). Login → `POST login` (fallback `POST admin/login`); stores `fp_token` + `fp_user` in localStorage.
- **Navigation**: `NAV` in [src/data/nav.js](src/data/nav.js); leaf `module` matches route perm; sidebar filters by `can('<module>:view')`. Icons inline SVG in [src/components/Icon.jsx](src/components/Icon.jsx).
- **Theme**: CSS custom properties in [src/scss/_tokens.scss](src/scss/_tokens.scss); pre-paint script in `index.html` sets `data-theme` before first render.

## Conventions

1. Reuse `src/components/crud/*` and `src/components/*` — don't hand-roll tables/forms/modals/toasts (`showToast` from `src/v4/toast.js`).
2. All backend calls go through `src/api/client.js`; one module per resource, mapping responses to the UI shape and throwing on `{status:'error'}`.
3. Never hard-code a backend URL — only `src/api/config.js` / `.env`.
4. Gate with RBAC: `ProtectedRoute perm`, `can()`, `<Can>`; update `src/domain/permissions.js` for new modules.
5. Colors via CSS custom properties (`_tokens.scss`), never hex in components.
6. Subpath-safe URLs via `import.meta.env.BASE_URL`; no hard-coded leading `/`.
7. No `console.*` in shipped code; handle loading/empty/error states.

## Recipes

### New page
1. `src/pages/<Module>/<Page>/index.jsx`.
2. Route in `src/App.jsx` wrapped with `guard('<module>:view', <Page/>)`.
3. NAV leaf in `src/data/nav.js` (`module` = perm prefix); add icon to `src/components/Icon.jsx` if new.

### CRUD list
- Mock: `ResourcePage` (`perm`, `title`, `data`, `columns`, `formFields`, `filters`, `summary`, `searchKeys`).
- Real API: add `src/api/<resource>.js`; page uses `DataTable serverMode` + `FormModal` + `ConfirmDialog`, fetching in a `useEffect`-driven `load()`. Reference `src/api/stations.js` + `src/pages/Stations/StationList`.

### Forms
`FormModal` + `FormField` (`text|number|email|tel|date|textarea|select|file|checkbox`; `required`, `validate`, `derive`, `options`, `span`, `accept`).

## Anti-patterns

- No jQuery, Bootstrap, Tailwind, PostCSS, or state library.
- Don't hand-roll tables/forms/modals/toasts — use the `crud` components.
- Don't `fetch()` hard-coded URLs — use the `api` client.
- Don't put protected pages outside `RequireAuth`/`ProtectedRoute`, or break folder-per-page.
- Don't use hex colors in components; don't edit `dist/` or `node_modules/`.
