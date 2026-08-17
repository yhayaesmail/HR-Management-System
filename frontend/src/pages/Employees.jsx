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
  Pagination,
  Field,
  formatDate,
  formatMoney,
} from "../components/ui.jsx";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  department: "",
  title: "",
  salary: "",
  phone: "",
  address: "",
};

export default function Employees() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async (q = query) => {
    setError("");
    try {
      const res = await api("/employees", { params: q });
      setData(res);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [query.page]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.user?.email || "",
      password: "",
      department: emp.department,
      title: emp.title,
      salary: emp.salary,
      phone: emp.phone || "",
      address: emp.address || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        const body = {};
        for (const k of ["name", "department", "title", "phone", "address"])
          if (form[k]) body[k] = form[k];
        if (form.salary !== "") body.salary = Number(form.salary);
        if (form.email) body.email = form.email;
        if (form.password) body.password = form.password;
        await api(`/employees/${editing.id}`, { method: "PUT", body });
        setNotice("Employee updated");
      } else {
        await api("/employees", {
          method: "POST",
          body: {
            name: form.name,
            email: form.email,
            password: form.password,
            department: form.department,
            title: form.title,
            salary: Number(form.salary),
            phone: form.phone || undefined,
            address: form.address || undefined,
          },
        });
        setNotice("Employee created");
      }
      setShowForm(false);
      load({ ...query, page: 1 });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}?`)) return;
    try {
      await api(`/employees/${emp.id}`, { method: "DELETE" });
      setNotice("Employee deleted");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div className="content">
      <PageHeader
        title="Employees"
        actions={isAdmin && <button className="btn btn-primary" onClick={openCreate}>Add employee</button>}
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <Card>
        <div className="toolbar" style={{ padding: "14px 14px 0" }}>
          <input
            className="input"
            style={{ maxWidth: 260 }}
            placeholder="Search name or email"
            value={query.search}
            onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))}
            onKeyDown={(e) => e.key === "Enter" && load({ ...query, page: 1 })}
          />
          <button className="btn btn-sm" onClick={() => load({ ...query, page: 1 })}>
            Search
          </button>
        </div>

        {!data ? (
          <SkeletonTable cols={7} rows={6} />
        ) : data.employees.length === 0 ? (
          <Empty message="No employees found" />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Title</th>
                    <th>Salary</th>
                    <th>Joined</th>
                    <th>Status</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {data.employees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.name}</td>
                      <td>{e.user?.email}</td>
                      <td>{e.department}</td>
                      <td>{e.title}</td>
                      <td className="num">{formatMoney(e.salary)}</td>
                      <td>{formatDate(e.createdAt)}</td>
                      <td>
                        <Badge tone={e.isActive ? "success" : "danger"}>
                          {e.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button className="btn btn-sm" onClick={() => openEdit(e)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => remove(e)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
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

      {showForm && (
        <Modal
          title={editing ? "Edit employee" : "Add employee"}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving} onClick={submit}>
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          }
        >
          <form onSubmit={submit}>
            {formError && <Alert>{formError}</Alert>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Full name">
                <input className="input" value={form.name} onChange={set("name")} required />
              </Field>
              <Field label="Email">
                <input className="input" type="email" value={form.email} onChange={set("email")} required />
              </Field>
              <Field label="Department">
                <input className="input" value={form.department} onChange={set("department")} required />
              </Field>
              <Field label="Title">
                <input className="input" value={form.title} onChange={set("title")} required />
              </Field>
              <Field label="Salary (USD)">
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salary}
                  onChange={set("salary")}
                  required
                />
              </Field>
              <Field label="Phone">
                <input className="input" value={form.phone} onChange={set("phone")} />
              </Field>
            </div>
            {!editing && (
              <Field label="Temporary password">
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  required
                  placeholder="Minimum 6 characters"
                />
              </Field>
            )}
            <Field label="Address">
              <input className="input" value={form.address} onChange={set("address")} />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  );
}