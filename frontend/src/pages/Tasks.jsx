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
} from "../components/ui.jsx";

const EMPTY_FORM = {
  title: "",
  description: "",
  employeeId: "",
  priority: "MEDIUM",
  runningTaskDeadline: "",
};

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    try {
      const res = await api(isAdmin ? "/tasks" : "/tasks/my");
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

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || "",
      employeeId: t.employeeId,
      priority: t.priority,
      runningTaskDeadline: t.runningTaskDeadline
        ? t.runningTaskDeadline.slice(0, 10)
        : "",
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        runningTaskDeadline: new Date(form.runningTaskDeadline).toISOString(),
      };
      if (editing) {
        if (form.employeeId) body.employeeId = form.employeeId;
        await api(`/tasks/${editing.id}`, { method: "PUT", body });
        setNotice("Task updated");
      } else {
        body.employeeId = form.employeeId;
        await api("/tasks", { method: "POST", body });
        setNotice("Task created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (task) => {
    const next =
      task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
    try {
      await api(`/tasks/${task.id}/status`, { method: "PATCH", body: { status: next } });
      load();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const remove = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await api(`/tasks/${task.id}`, { method: "DELETE" });
      setNotice("Task deleted");
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

  const list = data || [];
  const statusTone = {
    TODO: "info",
    IN_PROGRESS: "accent",
    DONE: "success",
  };
  const priorityTone = {
    HIGH: "danger",
    MEDIUM: "warning",
    LOW: "info",
  };

  return (
    <div className="content">
      <PageHeader
        title="Tasks"
        actions={isAdmin && <button className="btn btn-primary" onClick={openCreate}>New task</button>}
      />

      {notice && <Alert tone={notice.startsWith("Failed") || notice.startsWith("Cannot") ? "error" : "success"}>{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <Card pad>
        {!data ? (
          <SkeletonTable cols={6} rows={5} />
        ) : list.length === 0 ? (
          <Empty message="No tasks" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  {isAdmin && <th>Assignee</th>}
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td style={{ maxWidth: 260 }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {t.description}
                      </span>
                    </td>
                    {isAdmin && <td>{t.employee?.name || t.employeeId}</td>}
                    <td>
                      <Badge tone={priorityTone[t.priority] || "info"}>{t.priority}</Badge>
                    </td>
                    <td>
                      <Badge tone={statusTone[t.status] || "info"}>{t.status.replace("_", " ")}</Badge>
                    </td>
                    <td>{formatDate(t.runningTaskDeadline)}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button className="btn btn-sm" onClick={() => changeStatus(t)}>
                            {t.status === "TODO" ? "Start" : t.status === "IN_PROGRESS" ? "Complete" : "Reopen"}
                          </button>
                          <button className="btn btn-sm" onClick={() => openEdit(t)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => remove(t)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showForm && (
        <Modal
          title={editing ? "Edit task" : "New task"}
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
            <Field label="Title">
              <input className="input" value={form.title} onChange={set("title")} required />
            </Field>
            <Field label="Description">
              <textarea className="textarea" value={form.description} onChange={set("description")} required />
            </Field>
            {!editing && (
              <Field label="Assignee">
                <select className="select" value={form.employeeId} onChange={set("employeeId")} required>
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </Field>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Priority">
                <select className="select" value={form.priority} onChange={set("priority")}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </Field>
              <Field label="Deadline">
                <input className="input" type="date" value={form.runningTaskDeadline} onChange={set("runningTaskDeadline")} required />
              </Field>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}