// Renders a `.status` pill given a status map ({ key: { label, cls } }).
export default function StatusBadge({ value, map }) {
  const meta = map?.[value] || { label: value, cls: 'status-blue' };
  return <span className={`status ${meta.cls}`}>{meta.label}</span>;
}
