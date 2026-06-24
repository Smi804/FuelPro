# Fuel-Pro v4 — React edition

The Fuel-Pro admin template, rebuilt as a **React + Vite + React Router**
single-page app. It reuses the original SCSS design system verbatim, so the look
(including dark mode) is identical to the original. Heavy dependencies from the
original template (ECharts, DataTables, Leaflet, jQuery) are gone — charts,
tables, and interactive widgets are implemented natively in React.

## Stack

- **React 18** + **React Router 6** (client-side routing)
- **Vite** dev server / bundler
- **Sass** — the original `v4` SCSS partials, under `src/scss/`
- No Bootstrap, no jQuery, no UI library

## Commands

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the built dist/
```

## Pages

| Route                 | Page             |
| --------------------- | ---------------- |
| `/`                   | Operations dashboard |
| `/analytics`          | Analytics dashboard |
| `/sales`              | Sales dashboard |
| `/system`             | System health dashboard |
| `/tables`             | Tables (search / sort / pagination / selection) |
| `/forms`              | Forms (tags, rating, stepper, OTP, password meter…) |
| `/forms/advanced`     | Advanced controls |
| `/forms/buttons`      | Buttons |
| `/forms/upload`       | File upload |
| `/forms/validation`   | Validation states |
| `/forms/wizard`       | Onboarding wizard |
| `/inbox`              | Inbox (three-pane mail) |
| `/kanban`             | Kanban (drag-and-drop) |
| `/notifications`      | Notifications |
| `/products`           | Products (storefront) |
| `/products/detail`    | Product detail |
| `/invoice`            | Invoice (editable line items) |
| `/pricing`            | Pricing tables |
| `/projects`           | Projects |
| `/projects/detail`    | Project detail |
| `/contacts`           | Contacts |
| `/users`              | User management |
| `/profile`            | Profile |
| `/settings`           | Settings |
| `/faq`                | Help center |
| `/login` `/register` `/forgot-password` | Auth (standalone, no shell) |
| `*`                   | 404 |

## Structure

```text
src/
├── main.jsx              # Entry — BrowserRouter + App
├── App.jsx               # Route table
├── components/           # Shell + reusable UI
│   ├── AdminLayout.jsx   # Sidebar + Topbar + Footer + <Outlet/> + mobile drawer
│   ├── Sidebar.jsx  Topbar.jsx  Footer.jsx
│   ├── Icon.jsx          # Inline-SVG nav icons
│   ├── MiniCharts.jsx    # Dependency-free area/bar/donut/gauge visuals
│   ├── Modal.jsx  Toggle.jsx  PageHeader.jsx
│   ├── AuthBrand.jsx  SocialButtons.jsx
├── pages/                # One component per route
├── data/                 # Demo data (nav, customers, kanban, mail)
├── hooks/useTheme.js     # Theme toggle backed by localStorage
├── v4/toast.js           # Lightweight toast helper
└── scss/                 # The original v4 SCSS, reused as-is
```

Theme handling mirrors the original: a pre-paint script in `index.html` applies
the stored/system theme before first render (no flash), and the topbar toggle
flips `data-theme` on `<html>` and persists it.
