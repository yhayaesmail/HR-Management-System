import express from "express";
import employeeRoutes from "../modules/employee/employee.routes.js";
import attendanceRoutes from "../modules/attendance/Attendance.route.js";
import authRoutes from "../modules/auth/auth.routes.js";
import taskRoutes from "../modules/tasks/tasks.route.js";
import payrollRoutes from "../modules/payroll/payroll.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/tasks", taskRoutes);
router.use("/payroll", payrollRoutes);

export default router;
