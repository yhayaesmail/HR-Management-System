import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/client.js";

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 50);

export default function RegisterCompany() {
  const { adopt } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    companySlug: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: value };
      if (k === "companyName" && !slugEdited) next.companySlug = slugify(value);
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const res = await api("/auth/register-company", {
        method: "POST",
        body: {
          companyName: form.companyName,
          companySlug: form.companySlug,
          email: form.email,
          password: form.password,
        },
      });
      adopt(res.data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card wide" onSubmit={submit}>
        <h1>Create your company</h1>
        <div className="login-sub">Set up your HR workspace in seconds</div>
        {error && <div className="login-error">{error}</div>}
        <div className="field">
          <label>Company name</label>
          <input
            className="input"
            value={form.companyName}
            onChange={set("companyName")}
            placeholder="Acme Corp"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div className="field">
          <label>Workspace slug</label>
          <input
            className="input"
            value={form.companySlug}
            onChange={(e) => {
              setSlugEdited(true);
              set("companySlug")(e);
            }}
            placeholder="acmecorp"
            pattern="[A-Za-z0-9]+"
            title="Letters and numbers only"
            minLength={2}
            maxLength={50}
            required
          />
          <div className="field-hint">Letters and numbers only — identifies your workspace</div>
        </div>
        <div className="field">
          <label>Admin email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={set("email")}
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
            minLength={7}
            required
          />
          <div className="field-hint">At least 7 characters</div>
        </div>
        <div className="field">
          <label>Confirm password</label>
          <input
            className="input"
            type="password"
            value={form.confirm}
            onChange={set("confirm")}
            autoComplete="new-password"
            required
          />
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy}
          style={{ width: "100%" }}
        >
          {busy ? "Creating workspace..." : "Create workspace"}
        </button>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
