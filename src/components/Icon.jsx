const base = {
  className: 'icon',
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5
};

const PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="10" width="7" height="11" rx="1.5" />
    </>
  ),
  tables: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M9 10v9M15 10v9" />
    </>
  ),
  forms: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6M9 13h4" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 6 10-6" />
    </>
  ),
  kanban: (
    <>
      <rect x="3" y="3" width="6" height="14" rx="1.5" />
      <rect x="11" y="3" width="6" height="9" rx="1.5" />
      <rect x="19" y="3" width="2" height="6" rx="0.5" />
    </>
  ),
  profile: (
    <>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
  charts: <path d="M4 19V5M8 19v-8M12 19V9M16 19v-5M20 19v-9" />,
  bell: (
    <>
      <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z" />
      <path d="M10.5 21a1.5 1.5 0 003 0" />
    </>
  ),
  shop: (
    <>
      <path d="M3 9l1-5h16l1 5M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9M3 9h18" />
      <path d="M9 13a3 3 0 006 0" />
    </>
  ),
  tag: (
    <>
      <path d="M20 13l-7 7a2 2 0 01-2.83 0L3 12.83V4h8.83L20 12.17a2 2 0 010 2.83z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 21V3h14v18l-3-2-3 2-3-2-3 2-2-2z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  price: (
    <>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M16 6H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H7" />
    </>
  ),
  projects: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  pages: (
    <>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M2 8h20" />
    </>
  ),
  users: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </>
  ),
  fuel: (
    <>
      <path d="M4 21V5a2 2 0 012-2h6a2 2 0 012 2v16" />
      <path d="M3 21h12" />
      <path d="M8 8h4" />
      <path d="M14 8l3 2v7a2 2 0 002 2 2 2 0 002-2V9l-3-3" />
    </>
  ),
  inventory: (
    <>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </>
  ),
  truck: (
    <>
      <rect x="1" y="6" width="13" height="10" rx="1" />
      <path d="M14 9h4l3 3v4h-7z" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="17" cy="14" r="1" fill="currentColor" />
    </>
  ),
  book: (
    <>
      <path d="M4 4h13a2 2 0 012 2v14H6a2 2 0 01-2-2z" />
      <path d="M4 18a2 2 0 012-2h13" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  )
};

export default function Icon({ name }) {
  const path = PATHS[name];
  if (!path) return null;
  return <svg {...base}>{path}</svg>;
}
