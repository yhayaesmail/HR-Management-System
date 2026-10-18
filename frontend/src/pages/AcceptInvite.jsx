import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/client.js";

export default function AcceptInvite() {
  const { token } = useParams();
  const { adopt } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const res = await api("/auth/register-employee", {
        method: "POST",
        body: { email: form.email, password: form.password, inviteToken: token },
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
      <form className="login-card" onSubmit={submit}>
        <h1>You're invited</h1>
        <div className="login-sub">Set up your account to join your team</div>
        {error && <div className="login-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="The email your invite was sent to"
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
          {busy ? "Joining..." : "Join your team"}
        </button>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
