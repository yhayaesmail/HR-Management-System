import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function Progress() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const res = await fetch(
        `${API_BASE}/hiring/progress/${encodeURIComponent(email.trim())}`,
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Request failed (${res.status})`);
      }
      setResult(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" style={{ maxWidth: 520 }} onSubmit={submit}>
        <h1>Application Progress</h1>
        <div className="login-sub">Enter your email to check your status</div>
        {error && <div className="login-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy}
          style={{ width: "100%" }}
        >
          {busy ? "Checking..." : "Check progress"}
        </button>
        {result && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="label">Name</div>
                  <div className="value">
                    {result.firstName} {result.lastName}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="label">Position</div>
                  <div className="value">{result.position}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Status</div>
                  <div className="value">{result.status}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Applied</div>
                  <div className="value">
                    {result.dateApplied
                      ? new Date(result.dateApplied).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 13 }}>
          <Link to="/applications/apply">Submit a new application</Link>
        </div>
      </form>
    </div>
  );
}
