export default function ProfileSkeleton() {
  return (
    <div aria-hidden="true">
      <span className="ws-skeleton" style={{ height: 14, width: 150, marginBottom: 24 }} />

      <div className="profile-layout">
        <div className="profile-panel">
          <span
            className="ws-skeleton"
            style={{ height: 72, width: 72, borderRadius: "50%", margin: "0 auto 20px" }}
          />
          <span className="ws-skeleton" style={{ height: 22, width: "50%", margin: "0 auto 10px" }} />
          <span className="ws-skeleton" style={{ height: 14, width: "70%", margin: "0 auto 20px" }} />
          <span className="ws-skeleton" style={{ height: 44, width: "100%", borderRadius: 12, marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span className="ws-skeleton" style={{ height: 18, width: 60 }} />
                <span className="ws-skeleton" style={{ height: 11, width: 70 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="settings-panel">
          <div className="settings-head">
            <span className="ws-skeleton" style={{ height: 16, width: 16, borderRadius: 4 }} />
            <div style={{ flex: 1 }}>
              <span className="ws-skeleton" style={{ height: 18, width: 180, marginBottom: 8 }} />
              <span className="ws-skeleton" style={{ height: 13, width: "90%" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[80, 100, 80].map((w, i) => (
              <span key={i} className="ws-skeleton" style={{ height: 28, width: w, borderRadius: 999 }} />
            ))}
          </div>
          <span className="ws-skeleton" style={{ height: 44, borderRadius: 10, marginBottom: 16 }} />
          <div className="settings-grid">
            <span className="ws-skeleton" style={{ height: 44, borderRadius: 10 }} />
            <span className="ws-skeleton" style={{ height: 44, borderRadius: 10 }} />
          </div>
          <span className="ws-skeleton" style={{ height: 38, width: 220, borderRadius: 10, marginBottom: 20 }} />
          <span className="ws-skeleton" style={{ height: 42, width: 140, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
