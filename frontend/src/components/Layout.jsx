import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const ADMIN_SECTIONS = [
  { label: "Overview", links: [{ to: "/", label: "Dashboard" }] },
  {
    label: "Management",
    links: [
      { to: "/employees", label: "Employees" },
      { to: "/attendance", label: "Attendance" },
      { to: "/payroll", label: "Payroll" },
      { to: "/tasks", label: "Tasks" },
      { to: "/hiring", label: "Hiring" },
    ],
  },
];

const EMPLOYEE_SECTIONS = [
  {
    label: "Overview",
    links: [
      { to: "/", label: "Dashboard" },
      { to: "/attendance", label: "My Attendance" },
      { to: "/tasks", label: "My Tasks" },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = user?.role === "ADMIN" ? ADMIN_SECTIONS : EMPLOYEE_SECTIONS;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          HR Console <small>v1</small>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section">{section.label}</div>
              {section.links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  end={l.to === "/"}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="role-tag">{user?.role === "ADMIN" ? "Admin" : "Employee"}</div>
          <div className="user-email">{user?.email}</div>
          <button className="btn btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}