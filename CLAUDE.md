# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository. Cross-tool counterparts: [AGENTS.md](AGENTS.md), [.cursor/rules/project.mdc](.cursor/rules/project.mdc). Content overlaps intentionally.

## What this is

**Fuel-Pro** — a multi-tenant fuel-station management admin app. **React 18 + Vite + React Router 6**, styled with the original Colorlib **SCSS** design system (reused verbatim, dark mode included). No Bootstrap, no jQuery, no Tailwind/PostCSS, no extra state library. Pages currently render **mock data** from `src/data/mock/`; real backend endpoints are integrated through `src/api/`.

## Commands

```bash
npm install
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the built dist/
```

There are no `lint`/`format` npm scripts. A Prettier config exists — run `npx prettier --write <files>` if needed. Rely on editor/IDE diagnostics for linting.

## Architecture

- **Entry**: [src/main.jsx](src/main.jsx) mounts `BrowserRouter → AuthProvider → App`.
- **Routes**: [src/App.jsx](src/App.jsx). Protected pages live under `<RequireAuth><AdminLayout/></RequireAuth>` and are wrapped with `guard('<module>:view', <Page/>)` (which renders `ProtectedRoute`). Auth pages (`/login`, `/register`, `/forgot-password`) are outside the shell.
- **Folder-per-page**: every page is `src/pages/<Module>/<Page>/index.jsx`, with its subcomponents (`columns.jsx`, `tabs.jsx`, …) beside it.
- **Shell**: [src/components/AdminLayout.jsx](src/components/AdminLayout.jsx) renders `Sidebar` + `Topbar` + `Footer` + `<Outlet/>`, handles the mobile drawer and the desktop collapse (rail) toggle.
- **Reusable CRUD UI**: [src/components/crud/](src/components/crud/) — `ResourcePage`, `DataTable` (client + controlled `serverMode`), `FormModal`, `FormField`, `FilterBar`, `ConfirmDialog`, `SummaryCard`, `StatusBadge`, `Tabs`, `Dropdown`, `ExportButtons`, `ChartCard`. Plus `Modal`, `PageHeader`, `Icon`, `MiniCharts` in `src/components/`.
- **API layer**: [src/api/](src/api/) — `config.js` holds the only backend URL (`API_BASE_URL`, from `VITE_API_BASE_URL` in `.env`); `client.js` exposes `api.get/post/put/patch/del` (auto-attaches the `fp_token` Bearer header, throws on non-2xx and on network failure as `status: 0`); one module per resource (e.g. `stations.js`).
- **Auth + RBAC**: [src/auth/](src/auth/) — `AuthContext` (`useAuth`: `user`, `can`, `login`, `logout`, `setRole`, `stations`, `activeStationId`), `RequireAuth`, `ProtectedRoute`, `Can`, `authApi`. The permission matrix is [src/domain/permissions.js](src/domain/permissions.js); roles in [src/domain/roles.js](src/domain/roles.js). Login hits the backend (`POST login`, fallback `POST admin/login`) and stores `fp_token` + `fp_user` in localStorage.
- **Navigation**: single source `NAV` in [src/data/nav.js](src/data/nav.js); each leaf's `module` matches its route permission. Sidebar filters items by `can('<module>:view')`. Icons are inline SVG in [src/components/Icon.jsx](src/components/Icon.jsx).
- **Theme**: CSS custom properties in [src/scss/_tokens.scss](src/scss/_tokens.scss) under `:root` / `[data-theme="dark"]`; a pre-paint script in `index.html` applies the stored theme before first render.

## Conventions

1. **Reuse, don't hand-roll.** Build lists/forms/overlays from `src/components/crud/*` and `src/components/*`; don't write bespoke tables, modals, or toasts. Toasts: `showToast` from `src/v4/toast.js`.
2. **All backend calls go through `src/api/client.js`.** One module per resource; map the API response to the UI shape inside that module and surface `{status:'error'}` as a thrown error.
3. **Never hard-code a backend URL** — it belongs only in `src/api/config.js` / `.env`.
4. **Gate by RBAC.** Routes via `ProtectedRoute perm`, UI via `can()` / `<Can>`. Update `src/domain/permissions.js` when adding a module.
5. **Colors via CSS custom properties** (`_tokens.scss`); never hex literals in components.
6. **Subpath-safe URLs**: `import.meta.env.BASE_URL` for assets; never a hard-coded leading `/`.
7. **No `console.*` in shipped code.** Components must handle loading/empty/error states.

## Recipes

### New page
1. `src/pages/<Module>/<Page>/index.jsx`.
2. Route in `src/App.jsx`: `<Route path="/x" element={guard('<module>:view', <X/>)} />`.
3. NAV leaf in `src/data/nav.js` (`module` = perm prefix); add an icon to `src/components/Icon.jsx` if new.

### CRUD list (mock)
Use `ResourcePage` with `perm`, `title`, `data`, `columns`, `formFields`, `filters`, `summary`, `searchKeys`.

### CRUD list (real API)
1. Add `src/api/<resource>.js` wrapping the endpoints (see `src/api/stations.js`).
2. Page uses `DataTable serverMode` (controlled `page`/`onPageChange`, `sort`/`onSortChange`, `totalRows`, `loading`) + `FormModal` + `ConfirmDialog`; fetch in a `load()` driven by `useEffect`.

### Forms
`FormModal` with a `fields` config. `FormField` types: `text|number|email|tel|date|textarea|select|file|checkbox`, with `required`, `validate(value, values)`, `derive(values)`, `options`, `span`, `accept`.

## Anti-patterns

- Don't add jQuery, Bootstrap, Tailwind, PostCSS, or a state library.
- Don't hand-roll tables/forms/modals/toasts — use the `crud` components.
- Don't `fetch()` a hard-coded URL — use the `api` client + `src/api/config.js`.
- Don't put a protected page outside `RequireAuth` / `ProtectedRoute`, or break folder-per-page.
- Don't use hex colors in components.
- Don't edit `dist/` or `node_modules/`.
