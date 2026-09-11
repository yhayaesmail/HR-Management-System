import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  education: "",
  graduateYear: "",
  experience: "",
  position: "",
  coverLetter: "",
};

export default function Apply() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/hiring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Request failed (${res.status})`);
      }
      setSuccess("Application submitted successfully. We will contact you soon.");
      setForm(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" style={{ maxWidth: 520 }} onSubmit={submit}>
        <h1>Job Application</h1>
        <div className="login-sub">Fill the form below to apply</div>
        {error && <div className="login-error">{error}</div>}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            {success}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>First name</label>
            <input className="input" value={form.firstName} onChange={set("firstName")} required minLength={2} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Last name</label>
            <input className="input" value={form.lastName} onChange={set("lastName")} required minLength={2} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label>Email</label>
          <input className="input" type="email" value={form.email} onChange={set("email")} required />
        </div>
        <div className="field">
          <label>Position</label>
          <input className="input" value={form.position} onChange={set("position")} required placeholder="e.g. IT Support" />
        </div>
        <div className="field">
          <label>Education</label>
          <input className="input" value={form.education} onChange={set("education")} required placeholder="e.g. BSc Computer Science" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>Graduate year</label>
            <input className="input" value={form.graduateYear} onChange={set("graduateYear")} required placeholder="e.g. 2023" />
          </div>
          <div className="field">
            <label>Experience</label>
            <input className="input" value={form.experience} onChange={set("experience")} required placeholder="e.g. 2 years helpdesk" />
          </div>
        </div>
        <div className="field">
          <label>Cover letter (optional)</label>
          <textarea className="textarea" value={form.coverLetter} onChange={set("coverLetter")} rows={4} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Submitting..." : "Submit application"}
        </button>
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 13 }}>
          <Link to="/applications/progress">Check your application progress</Link>
        </div>
      </form>
    </div>
  );
}
