export default function PageHeader({ pretitle, title, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-row">
        <div>
          {pretitle && <div className="page-pretitle">{pretitle}</div>}
          <h1 className="page-title">{title}</h1>
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
}
