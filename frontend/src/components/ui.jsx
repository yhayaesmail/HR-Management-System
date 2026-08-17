export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

export function Card({ title, children, actions, pad }) {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <h3>{title}</h3>
          {actions}
        </div>
      )}
      <div className={pad ? "card-body" : ""}>{children}</div>
    </div>
  );
}

export function Badge({ tone = "info", children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Kpi({ label, value, note }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {note && <div className="kpi-note">{note}</div>}
    </div>
  );
}

export function Empty({ message, hint }) {
  return (
    <div className="empty-state">
      <div>{message || "No data"}</div>
      {hint && (
        <div style={{ fontSize: 12.5, marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div className="skeleton skeleton-line" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Alert({ tone = "error", children }) {
  return <div className={`alert alert-${tone}`}>{children}</div>;
}

export function Pagination({ page, totalPages, total, onChange }) {
  if (!total) return null;
  return (
    <div className="pagination">
      <span>
        {total} result{total === 1 ? "" : "s"}
      </span>
      <div className="spacer" />
      <button
        className="btn btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages || 1}
      </span>
      <button
        className="btn btn-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(n) {
  if (n === null || n === undefined) return "-";
  return Number(n).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}