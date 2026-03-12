import express from "express";
import employeeRoutes from "../modules/employees/employee.routes.js";
import attendanceRoutes from "../modules/attendance/Attendance.route.js";
import authRoutes from "../modules/auth/auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);

export default router;
