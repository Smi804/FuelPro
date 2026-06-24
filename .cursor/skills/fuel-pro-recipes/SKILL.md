---
name: fuel-pro-recipes
description: Use when adding Fuel-Pro pages, charts, page modules, overlays, navigation entries, or when looking up common project commands and file locations.
---

# Fuel-Pro Recipes

Load this skill only when the task needs detailed project workflow reminders.

## File layout

- `src/main-v4.js` - entry; mounts shell, lazy-loads page modules.
- `src/scss/v4/` - SCSS partials; `main.scss` is the entry.
- `src/v4/shell.js` - `mountShell()` runtime behavior.
- `src/v4/shell-render.js` - `NAV`, `ICONS`, and pure shell renderers.
- `src/v4/charts.js` - `initCharts()` plus ECharts factories.
- `src/v4/tables.js` - `initTables()` plus DataTables initialization.
- `src/v4/command-palette.js` - command palette.
- `src/v4/modal.js`, `src/v4/toast.js`, `src/v4/menus.js` - overlay helpers.
- `src/v4/inbox.js`, `src/v4/kanban.js`, `src/v4/calendar.js`, `src/v4/settings.js`, `src/v4/file-manager.js` - lazy-loaded page modules.
- `src/v4/form-controls.js` - date range, multi-select, and rich text controls.
- `production/` - server-rendered HTML entry pages.
- `types/Fuel-Pro.d.ts` - public JS surface declarations.
- `scripts/new-page.mjs` - page scaffolder.
- `scripts/deploy-preview.sh` - deploy preview helper.

## New page

Prefer the scaffolder:

```bash
npm run new -- reports --title "Reports" --nav-group "Admin"
```

Manual flow:

1. Add `production/<slug>.html`.
2. Set `<body data-shell="admin" data-page="<slug>" data-breadcrumb="Home > ...">`.
3. Load the shared entry with `<script type="module" src="/src/main-v4.js"></script>`.
4. Append a `NAV` leaf in `src/v4/shell-render.js` whose `key` matches `data-page`.

## New chart

1. Add markup like `<div class="card chart-card"><div class="chart" data-chart="<id>"></div></div>`.
2. Add a matching `case '<id>':` in `initCharts()` in `src/v4/charts.js`.
3. Read colors from CSS custom properties with `getComputedStyle(document.documentElement).getPropertyValue('--token')`.
4. Keep ECharts imports modular; do not import the full package namespace.

## New page module

In `src/main-v4.js`, lazy-load by DOM presence:

```js
if (document.querySelector('.reports-root')) {
  import('./v4/reports.js').then((m) => m.initReports());
}
```

Export a single idempotent `initReports()` from `src/v4/reports.js`.

## Modal and toast

```js
import { showModal } from './v4/modal.js';

showModal({
  title: 'Delete project?',
  body: 'This cannot be undone.',
  actions: [
    { label: 'Cancel', variant: 'ghost' },
    { label: 'Delete', variant: 'danger', action: () => {} },
  ],
});
```

```js
import { showToast } from './v4/toast.js';

showToast('Saved', { variant: 'success' });
```

## Common commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run new -- <slug>
npm run screenshots
npm run smoke
npm run analyze
npm run deploy:preview
```

Override the dev port with `PORT=...`. Build under a subpath with `BASE_PATH=/foo/ npm run build`.
