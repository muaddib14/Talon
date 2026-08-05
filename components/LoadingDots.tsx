export default function LoadingDots({ label }: { label: string }) {
  return (
    <p className="dash-loading">
      {label}
      <span className="dash-loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </p>
  );
}
