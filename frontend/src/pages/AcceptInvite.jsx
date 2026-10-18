import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/client.js";

const DEAD_INVITE_MESSAGES = {
  USED: "Invite token already used",
  EXPIRED: "Invite token expired",
  INVALID: "Invalid invite link",
  ERROR: "Invalid invite link",
};

export default function AcceptInvite() {
  const { token } = useParams();
  const { adopt } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("CHECKING");
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api(`/auth/invite/${token}`)
      .then((res) => {
        if (active) setStatus(res.data?.status || "INVALID");
      })
      .catch(() => {
        if (active) setStatus("ERROR");
      });
    return () => {
      active = false;
    };
  }, [token]);

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
      if (err.message === "Invite token already used") setStatus("USED");
      else if (err.message === "Invite token expired") setStatus("EXPIRED");
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (status === "CHECKING") {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>You're invited</h1>
          <div className="login-sub">Checking your invitation...</div>
        </div>
      </div>
    );
  }

  if (status !== "VALID") {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>You're invited</h1>
          <div className="login-error" style={{ marginTop: 16 }}>
            {DEAD_INVITE_MESSAGES[status] || "Invalid invite link"}
          </div>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

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
