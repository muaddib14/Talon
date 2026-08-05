export default function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="session-hero">
        <span className="ws-skeleton" style={{ height: 24, width: 120, margin: "0 auto 20px", borderRadius: 999 }} />
        <span className="ws-skeleton" style={{ height: 40, width: "60%", margin: "0 auto 14px" }} />
        <span className="ws-skeleton" style={{ height: 16, width: "80%", margin: "0 auto 8px" }} />
        <span className="ws-skeleton" style={{ height: 16, width: "55%", margin: "0 auto 28px" }} />
        <span className="ws-skeleton" style={{ height: 56, width: "100%", borderRadius: 16, marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[140, 180, 150, 130].map((w, i) => (
            <span key={i} className="ws-skeleton" style={{ height: 30, width: w, borderRadius: 999 }} />
          ))}
        </div>
      </div>

      <div className="dash-section-head">
        <span className="ws-skeleton" style={{ height: 12, width: 110 }} />
      </div>

      <div className="session-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="session-card" style={{ opacity: 0.7 }}>
            <div className="session-card-top">
              <span className="ws-skeleton" style={{ height: 19, width: "60%" }} />
              <span className="ws-skeleton" style={{ height: 20, width: 64, borderRadius: 999 }} />
            </div>
            <div style={{ padding: "0 28px 28px" }}>
              <span className="ws-skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
              <span className="ws-skeleton" style={{ height: 14, width: "70%", marginBottom: 20 }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="ws-skeleton" style={{ height: 12, width: 60 }} />
                <span className="ws-skeleton" style={{ height: 12, width: 90 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
