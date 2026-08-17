import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/client.js";
import {
  PageHeader,
  Card,
  Kpi,
  Badge,
  Empty,
  SkeletonTable,
  formatDate,
  formatDateTime,
  formatMoney,
} from "../components/ui.jsx";

const statusTone = {
  WAITING: "warning",
  INTERVIEWED: "accent",
  PASSED: "success",
  REJECTED: "danger",
};

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!isAdmin) {
          const [tasks, payrolls] = await Promise.all([
            api("/tasks/my"),
            api("/payroll/my"),
          ]);
          if (!active) return;
          setData({ tasks: tasks.data, payrolls: payrolls.data });
          return;
        }

        const [employees, hiring, today, tasks, payrolls] = await Promise.all([
          api("/employees?limit=1").catch(() => null),
          api("/hiring?limit=1").catch(() => null),
          api("/attendance/today").catch(() => null),
          api("/tasks").catch(() => null),
          api("/payroll").catch(() => null),
        ]);
        if (!active) return;
        setData({
          employees,
          hiring,
          today,
          tasks,
          payrolls,
        });
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  if (error) {
    return (
      <div className="content">
        <PageHeader title="Dashboard" />
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="content">
        <PageHeader title="Dashboard" />
        <SkeletonTable cols={4} rows={4} />
      </div>
    );
  }

  if (!isAdmin) {
    const tasks = data.tasks || [];
    const payrolls = data.payrolls || [];
    const open = tasks.filter((t) => t.status !== "DONE").length;
    const totalSalary = payrolls.reduce((s, p) => s + (p.finalSalary || 0), 0);
    return (
      <div className="content">
        <PageHeader title="Dashboard" />
        <div className="kpi-grid">
          <Kpi label="Open tasks" value={open} note={`${tasks.length} total assigned`} />
          <Kpi
            label="Tasks completed"
            value={tasks.filter((t) => t.status === "DONE").length}
          />
          <Kpi label="Payroll records" value={payrolls.length} />
          <Kpi label="Total earned" value={formatMoney(totalSalary)} />
        </div>
        <Card title="Recent tasks" pad>
          {tasks.length === 0 ? (
            <Empty message="No tasks assigned" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 8).map((t) => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>
                        <Badge tone={t.priority === "HIGH" ? "danger" : t.priority === "LOW" ? "success" : "info"}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={t.status === "DONE" ? "success" : t.status === "IN_PROGRESS" ? "accent" : "info"}>
                          {t.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td>{formatDate(t.runningTaskDeadline)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const emp = data.employees;
  const hir = data.hiring;
  const today = data.today?.records || [];
  const tasks = data.tasks?.data || [];
  const payrolls = data.payrolls?.data || [];
  const openTasks = tasks.filter((t) => t.status !== "DONE").length;
  const waitList = hir?.applications || [];
  const totalPayroll = payrolls.reduce((s, p) => s + (p.finalSalary || 0), 0);
  const presentToday = today.filter(
    (r) => r.status === "PRESENT" || r.status === "ON_TIME" || r.status === "LATE",
  ).length;

  return (
    <div className="content">
      <PageHeader title="Dashboard" subtitle="Overview of the organization" />

      <div className="kpi-grid">
        <Kpi label="Active employees" value={emp?.total ?? "-"} note="Across all departments" />
        <Kpi label="Open tasks" value={openTasks} note={`${tasks.length} total`} />
        <Kpi
          label="Applications pending"
          value={waitList.filter((a) => a.status === "WAITING").length}
          note={`${waitList.length} total`}
        />
        <Kpi label="Payroll (total)" value={formatMoney(totalPayroll)} note={`${payrolls.length} records`} />
      </div>

      <div className="kpi-grid">
        <Kpi label="Present today" value={presentToday} note={`${today.length} recorded`} />
        <Kpi label="Absent today" value={today.filter((r) => r.status === "ABSENT").length} />
        <Kpi
          label="Employees on payroll"
          value={new Set(payrolls.map((p) => p.employeeId)).size}
        />
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <Card title="Today's attendance" pad>
          {today.length === 0 ? (
            <Empty message="No attendance recorded today" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Check in</th>
                    <th>Check out</th>
                  </tr>
                </thead>
                <tbody>
                  {today.slice(0, 10).map((r) => (
                    <tr key={r.id}>
                      <td>{r.employee?.name || r.employeeId}</td>
                      <td>
                        <Badge tone={r.status === "ABSENT" ? "danger" : r.status === "LATE" ? "warning" : "success"}>
                          {r.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td>{formatDateTime(r.checkIn)}</td>
                      <td>{formatDateTime(r.checkOut)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Recent applications" pad>
          {waitList.length === 0 ? (
            <Empty message="No applications yet" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Position</th>
                    <th>Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {waitList.slice(0, 8).map((a) => (
                    <tr key={a.id}>
                      <td>
                        {a.firstName} {a.lastName}
                      </td>
                      <td>{a.position}</td>
                      <td>{formatDate(a.dateApplied)}</td>
                      <td>
                        <Badge tone={statusTone[a.status] || "info"}>
                          {a.status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}