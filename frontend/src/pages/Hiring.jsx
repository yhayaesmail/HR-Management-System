import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import {
  PageHeader,
  Card,
  Badge,
  Empty,
  SkeletonTable,
  Modal,
  Alert,
  Pagination,
  Field,
  formatDate,
} from "../components/ui.jsx";

const STATUSES = ["WAITING", "INTERVIEWED", "PASSED", "REJECTED"];
const statusTone = {
  WAITING: "warning",
  INTERVIEWED: "accent",
  PASSED: "success",
  REJECTED: "danger",
};

export default function Hiring() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState({ page: 1, limit: 10, status: "" });
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async (q = query) => {
    setError("");
    try {
      setData(await api("/hiring", { params: q }));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [query.page, query.status]);

  const view = async (email) => {
    try {
      setDetail(await api(`/hiring/${encodeURIComponent(email)}`));
    } catch (err) {
      setNotice(err.message);
    }
  };

  const setStatus = async (email, status) => {
    setBusy(true);
    try {
      await api(`/hiring/${encodeURIComponent(email)}`, {
        method: "PATCH",
        body: { status },
      });
      setNotice(`Status updated to ${status}`);
      if (detail?.data?.email === email) view(email);
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (email) => {
    if (!window.confirm(`Delete application for ${email}?`)) return;
    try {
      await api(`/hiring/${encodeURIComponent(email)}`, { method: "DELETE" });
      setNotice("Application deleted");
      setDetail(null);
      load();
    } catch (err) {
      setNotice(err.message);
    }
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const list = data?.applications || [];

  return (
    <div className="content">
      <PageHeader title="Hiring" subtitle="Manage candidate applications" />

      {notice && <Alert tone={notice.startsWith("Failed") || notice.startsWith("Cannot") ? "error" : "success"}>{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <Card>
        <div className="toolbar" style={{ padding: "14px 14px 0" }}>
          <select className="select" style={{ maxWidth: 200 }} value={query.status} onChange={(e) => setQuery((q) => ({ ...q, status: e.target.value, page: 1 }))}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="spacer" />
          <a className="btn" href="/api/hiring" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            Public application form (API)
          </a>
        </div>

        {!data ? (
          <SkeletonTable cols={6} rows={6} />
        ) : list.length === 0 ? (
          <Empty message="No applications found" />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Position</th>
                    <th>Education</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id}>
                      <td>
                        {a.firstName} {a.lastName}
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.email}</div>
                      </td>
                      <td>{a.position}</td>
                      <td>{a.education}</td>
                      <td>{formatDate(a.dateApplied)}</td>
                      <td>
                        <Badge tone={statusTone[a.status] || "info"}>{a.status.replace("_", " ")}</Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-sm" onClick={() => view(a.email)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onChange={(p) => setQuery((q) => ({ ...q, page: p }))}
            />
          </>
        )}
      </Card>

      {detail && (
        <Modal title="Application" onClose={() => setDetail(null)}>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="label">Name</div>
              <div className="value">
                {detail.data.firstName} {detail.data.lastName}
              </div>
            </div>
            <div className="detail-item">
              <div className="label">Email</div>
              <div className="value">{detail.data.email}</div>
            </div>
            <div className="detail-item">
              <div className="label">Position</div>
              <div className="value">{detail.data.position}</div>
            </div>
            <div className="detail-item">
              <div className="label">Applied</div>
              <div className="value">{formatDate(detail.data.dateApplied)}</div>
            </div>
            <div className="detail-item">
              <div className="label">Education</div>
              <div className="value">{detail.data.education}</div>
            </div>
            <div className="detail-item">
              <div className="label">Graduate year</div>
              <div className="value">{detail.data.graduateYear}</div>
            </div>
            <div className="detail-item">
              <div className="label">Experience</div>
              <div className="value">{detail.data.experience}</div>
            </div>
            <div className="detail-item">
              <div className="label">Status</div>
              <div className="value">
                <Badge tone={statusTone[detail.data.status] || "info"}>{detail.data.status.replace("_", " ")}</Badge>
              </div>
            </div>
          </div>
          {detail.data.coverLetter && (
            <div style={{ marginTop: 16 }}>
              <div className="label" style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                Cover letter
              </div>
              <p style={{ margin: 0, fontSize: 13.5, whiteSpace: "pre-wrap" }}>{detail.data.coverLetter}</p>
            </div>
          )}

          <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Move to:</span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className="btn btn-sm"
                  disabled={busy || s === detail.data.status}
                  onClick={() => setStatus(detail.data.email, s)}
                >
                  {s}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button className="btn btn-sm btn-danger" onClick={() => remove(detail.data.email)}>
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}