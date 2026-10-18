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
  department: "",
  title: "",
  salary: "",
  phone: "",
  address: "",
};

const EMPTY_INVITE = {
  name: "",
  email: "",
  department: "",
  title: "",
  salary: "",
};

export default function Employees() {
  const { user } = useAuth();
  const isAdmin = user?.role === "COMPANY_ADMIN";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

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

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.user?.email || "",
      department: emp.department,
      title: emp.title,
      salary: emp.salary,
      phone: emp.phone || "",
      address: emp.address || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const openInvite = () => {
    setInviteForm(EMPTY_INVITE);
    setInviteError("");
    setInviteLink("");
    setCopied(false);
    setShowInvite(true);
  };

  const setInvite = (k) => (e) => setInviteForm((f) => ({ ...f, [k]: e.target.value }));

  const createInvite = async (e) => {
    e.preventDefault();
    setInviteBusy(true);
    setInviteError("");
    try {
      const res = await api("/auth/invite", {
        method: "POST",
        body: {
          name: inviteForm.name,
          email: inviteForm.email,
          department: inviteForm.department,
          title: inviteForm.title,
          salary: inviteForm.salary === "" ? undefined : Number(inviteForm.salary),
        },
      });
      const base = window.location.origin + import.meta.env.BASE_URL;
      setInviteLink(`${base}#/invite/${res.data.token}`);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteBusy(false);
    }
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setInviteError("Copy failed — select the link and copy it manually");
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError("");
    try {
      const body = {};
      for (const k of ["name", "department", "title", "phone", "address"])
        if (form[k]) body[k] = form[k];
      if (form.salary !== "") body.salary = Number(form.salary);
      if (form.email) body.email = form.email;
      await api(`/employees/${editing.id}`, { method: "PUT", body });
      setNotice("Employee updated");
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
        actions={
          isAdmin && (
            <button className="btn btn-primary" onClick={openInvite}>Invite employee</button>
          )
        }
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
          <Empty
            message="No employees yet"
            hint={isAdmin ? "Use “Invite employee” to add your first team member" : undefined}
          />
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
          title="Edit employee"
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
            <div className="form-row-2">
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
            <Field label="Address">
              <input className="input" value={form.address} onChange={set("address")} />
            </Field>
          </form>
        </Modal>
      )}
      {showInvite && (
        <Modal
          title="Invite employee"
          onClose={() => setShowInvite(false)}
          footer={
            inviteLink ? (
              <button className="btn btn-primary" onClick={() => setShowInvite(false)}>
                Done
              </button>
            ) : (
              <>
                <button className="btn" onClick={() => setShowInvite(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={inviteBusy}
                  onClick={createInvite}
                >
                  {inviteBusy ? "Creating..." : "Generate invite link"}
                </button>
              </>
            )
          }
        >
          {inviteError && <Alert>{inviteError}</Alert>}
          {inviteLink ? (
            <>
              <Alert tone="success">
                Invite ready — share this link with {inviteForm.email}
              </Alert>
              <Field label="Invite link">
                <div className="invite-link-box">
                  <input className="input" value={inviteLink} readOnly onFocus={(e) => e.target.select()} />
                  <button className="btn" onClick={copyInvite}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </Field>
              <div className="field-hint">
                The link expires in 7 days and works once. When they accept, their employee
                profile is created automatically with the details you entered.
              </div>
            </>
          ) : (
            <form onSubmit={createInvite}>
              <div className="form-row-2">
                <Field label="Full name">
                  <input className="input" value={inviteForm.name} onChange={setInvite("name")} placeholder="Jane Doe" required />
                </Field>
                <Field label="Email">
                  <input
                    className="input"
                    type="email"
                    value={inviteForm.email}
                    onChange={setInvite("email")}
                    placeholder="name@company.com"
                    required
                  />
                </Field>
                <Field label="Department">
                  <input className="input" value={inviteForm.department} onChange={setInvite("department")} placeholder="Engineering" required />
                </Field>
                <Field label="Title">
                  <input className="input" value={inviteForm.title} onChange={setInvite("title")} placeholder="Software Engineer" required />
                </Field>
              </div>
              <Field label="Monthly salary (USD)">
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inviteForm.salary}
                  onChange={setInvite("salary")}
                  placeholder="3000"
                  required
                />
              </Field>
              <div className="field-hint">
                They'll set their own password when accepting the invite.
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}