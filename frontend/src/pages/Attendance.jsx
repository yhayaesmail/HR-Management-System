import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../api/client.js";
import {
  PageHeader,
  Card,
  Badge,
  Empty,
  SkeletonTable,
  Alert,
  Pagination,
  formatDateTime,
} from "../components/ui.jsx";

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [today, setToday] = useState(null);
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);

  const loadToday = async () => {
    try {
      setToday(isAdmin ? await api("/attendance/today") : null);
    } catch {
      /* optional */
    }
  };

  const loadRecords = async () => {
    setError("");
    try {
      setRecords(await api(isAdmin ? "/attendance/today" : "/attendance/my", { params: { page, limit: 15 } }));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadToday();
  }, [isAdmin]);

  useEffect(() => {
    loadRecords();
  }, [page, isAdmin]);

  const checkIn = async () => {
    try {
      await api("/attendance/check-in", { method: "POST", body: {} });
      setNotice("Checked in");
      loadToday();
      loadRecords();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const checkOut = async () => {
    try {
      await api("/attendance/check-out", { method: "POST", body: {} });
      setNotice("Checked out");
      loadToday();
      loadRecords();
    } catch (err) {
      setNotice(err.message);
    }
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const list = records?.records || [];

  return (
    <div className="content">
      <PageHeader
        title="Attendance"
        actions={
          !isAdmin && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={checkIn}>
                Check in
              </button>
              <button className="btn" onClick={checkOut}>
                Check out
              </button>
            </div>
          )
        }
      />

      {notice && <Alert tone={notice.startsWith("Already") || notice.startsWith("Cannot") ? "error" : "success"}>{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      {isAdmin && (
        <Card title="Today" pad>
          {!today ? (
            <SkeletonTable cols={4} rows={3} />
          ) : today.records.length === 0 ? (
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
                  {today.records.map((r) => (
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
      )}

      <div style={{ marginTop: 16 }}>
        <Card title={isAdmin ? "Records" : "My attendance"} pad>
          {!records ? (
            <SkeletonTable cols={4} rows={5} />
          ) : list.length === 0 ? (
            <Empty message="No attendance records" />
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      {isAdmin && <th>Employee</th>}
                      <th>Date</th>
                      <th>Status</th>
                      <th>Check in</th>
                      <th>Check out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.id}>
                        {isAdmin && <td>{r.employee?.name || r.employeeId}</td>}
                        <td>{formatDateTime(r.date)}</td>
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
              {!isAdmin && (
                <Pagination page={records.page} totalPages={records.totalPages} total={records.total} onChange={setPage} />
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}