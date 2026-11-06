type ProgressBarProps = {
  value: number;
  label: string;
  showValue?: boolean;
  size?: "sm" | "md";
};

export function ProgressBar({ value, label, showValue = true, size = "md" }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-wrap">
      <div className={`progress-track ${size === "sm" ? "progress-track-sm" : ""}`} role="progressbar" aria-label={label} aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
      {showValue ? <span className="progress-value">{safeValue}%</span> : null}
    </div>
  );
}
