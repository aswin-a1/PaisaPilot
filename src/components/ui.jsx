export function Icon({ children }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, detail, icon, accent = "blue" }) {
  return (
    <article className={`metric-card accent-${accent}`}>
      <div className="metric-top">
        <span className="muted">{label}</span>
        <span className={`metric-icon ${accent}`}>
          <Icon>{icon}</Icon>
        </span>
      </div>
      <div className="metric-value">{value}</div>
      <p className="metric-detail">{detail}</p>
    </article>
  );
}

export function ProgressBar({ value, color = "blue", label = "Progress" }) {
  const normalizedValue = Number.isFinite(value) ? value : 0;
  const percentage = Math.min(100, Math.max(0, normalizedValue * 100));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={label}
    >
      <div
        className={`progress-fill ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function Notice({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="notice" role="status">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
