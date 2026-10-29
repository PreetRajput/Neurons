export function StatusBanner({ tone = "info", children, onDismiss }) {
  return (
    <div className={`status-banner status-banner--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span>{children}</span>
      {onDismiss && <button className="icon-button" onClick={onDismiss} aria-label="Dismiss">×</button>}
    </div>
  );
}
