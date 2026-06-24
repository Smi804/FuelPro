import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import Tabs from '../../components/crud/Tabs.jsx';
import Icon from '../../components/Icon.jsx';
import { showToast } from '../../v4/toast.js';
import { NOTIFICATIONS } from '../../data/mock/system.js';

const ICON_TONE = { alert: 'red', info: 'blue', task: 'teal', mention: 'purple' };
const ICON_NAME = { alert: 'bell', info: 'bell', task: 'clock', mention: 'profile' };

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'alert', label: 'Alerts' },
  { key: 'mention', label: 'Mentions' }
];

export default function Notifications() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => {
    if (tab === 'all') return items;
    if (tab === 'unread') return items.filter((n) => n.unread);
    return items.filter((n) => n.kind === tab);
  }, [items, tab]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read', { variant: 'success' });
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Insights"
        title="Notifications"
        actions={<button className="btn btn-outline" onClick={markAllRead}>Mark all read</button>}
      />
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      <div className="card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
          {filtered.length === 0 && <p style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>Nothing here.</p>}
          {filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '12px 12px',
                borderRadius: 'var(--radius)',
                background: n.unread ? 'var(--bg-surface-secondary)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div className={`stat-icon ${ICON_TONE[n.kind]}`} style={{ width: 34, height: 34 }}>
                <Icon name={ICON_NAME[n.kind]} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cell-strong" style={{ fontSize: 13.5 }}>{n.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{n.body}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
              </div>
              {n.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
