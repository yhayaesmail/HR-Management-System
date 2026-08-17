import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/client.js";
import {
  PageHeader,
  Card,
  Badge,
  Empty,
  SkeletonTable,
  Modal,
  Alert,
  Field,
  formatDate,
  formatMoney,
} from "../components/ui.jsx";

export default function Payroll() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: "", baseSalary: "", bonus: "", deduction: "", month: "", year: "" });
  const [report, setReport] = useState(null);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    try {
      const res = await api(isAdmin ? "/payroll" : "/payroll/my");
      setData(res.data);
      if (isAdmin) {
        const emp = await api("/employees?limit=100");
        setEmployees(emp.employees || []);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/payroll", {
        method: "POST",
        body: {
          employeeId: form.employeeId,
          baseSalary: Number(form.baseSalary),
          bonus: Number(form.bonus) || 0,
          deduction: Number(form.deduction) || 0,
          month: Number(form.month),
          year: Number(form.year),
        },
      });
      setNotice("Payroll record created");
      setShowForm(false);
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    setSaving(true);
    try {
      await api(`/payroll/generate/${reportMonth}/${reportYear}`, { method: "POST" });
      setNotice(`Payroll generated for ${reportMonth}/${reportYear}`);
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
    }
  };

  const viewReport = async () => {
    try {
      setReport(await api(`/payroll/report/${reportMonth}/${reportYear}`));
    } catch (err) {
      setNotice(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this payroll record?")) return;
    try {
      await api(`/payroll/${id}`, { method: "DELETE" });
      setNotice("Payroll record deleted");
      load();
    } catch (err) {
      setNotice(err.message);
    }
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const list = data || [];
  const isErrorNotice = notice.startsWith("Failed") || notice.startsWith("Cannot") || notice.startsWith("No");

  return (
    <div className="content">
      <PageHeader
        title="Payroll"
        actions={isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add record</button>}
      />

      {notice && <Alert tone={isErrorNotice ? "error" : "success"}>{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      {isAdmin && (
        <Card title="Monthly report" pad>
          <div className="toolbar">
            <Field label="Month">
              <select className="select" value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))} style={{ minWidth: 100 }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Year">
              <input className="input" type="number" style={{ maxWidth: 100 }} value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))} />
            </Field>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", paddingBottom: 14 }}>
              <button className="btn" onClick={viewReport}>View report</button>
              <button className="btn btn-primary" disabled={saving} onClick={generate}>
                {saving ? "Generating..." : "Generate payroll"}
              </button>
            </div>
          </div>

          {report && report.data && (
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Total base salary</div>
                <div className="value">{formatMoney(report.data.totalBaseSalary ?? report.data.total)}</div>
              </div>
              <div className="detail-item">
                <div className="label">Total bonuses</div>
                <div className="value">{formatMoney(report.data.totalBonus)}</div>
              </div>
              <div className="detail-item">
                <div className="label">Total deductions</div>
                <div className="value">{formatMoney(report.data.totalDeductions)}</div>
              </div>
              <div className="detail-item">
                <div className="label">Final total</div>
                <div className="value">{formatMoney(report.data.totalFinalSalary)}</div>
              </div>
            </div>
          )}
        </Card>
      )}

      <div style={{ marginTop: 16 }}>
        <Card title="Records" pad>
          {!data ? (
            <SkeletonTable cols={5} rows={5} />
          ) : list.length === 0 ? (
            <Empty message="No payroll records" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {isAdmin && <th>Employee</th>}
                    <th>Period</th>
                    <th>Base</th>
                    <th>Bonus</th>
                    <th>Deduction</th>
                    <th>Final</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id}>
                      {isAdmin && <td>{p.employee?.name || p.employeeId}</td>}
                      <td>
                        {p.month}/{p.year}
                      </td>
                      <td className="num">{formatMoney(p.baseSalary)}</td>
                      <td className="num">{formatMoney(p.bonus)}</td>
                      <td className="num">{formatMoney(p.deduction)}</td>
                      <td className="num">{formatMoney(p.finalSalary)}</td>
                      {isAdmin && (
                        <td style={{ textAlign: "right" }}>
                          <button className="btn btn-sm btn-danger" onClick={() => remove(p.id)}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {showForm && (
        <Modal
          title="Add payroll record"
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={submit}>
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          }
        >
          <form onSubmit={submit}>
            <Field label="Employee">
              <select className="select" value={form.employeeId} onChange={set("employeeId")} required>
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Base salary (USD)">
                <input className="input" type="number" min="0" value={form.baseSalary} onChange={set("baseSalary")} required />
              </Field>
              <Field label="Bonus (USD)">
                <input className="input" type="number" min="0" value={form.bonus} onChange={set("bonus")} />
              </Field>
              <Field label="Deduction (USD)">
                <input className="input" type="number" min="0" value={form.deduction} onChange={set("deduction")} />
              </Field>
              <Field label="Month">
                <input className="input" type="number" min="1" max="12" value={form.month} onChange={set("month")} required />
              </Field>
              <Field label="Year">
                <input className="input" type="number" min="2000" value={form.year} onChange={set("year")} required />
              </Field>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}