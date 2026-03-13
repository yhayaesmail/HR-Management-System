import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import employeeRoutes from "./modules/employee/employee.routes.js";
import attendanceRoutes from "./modules/attendance/Attendance.route.js";
import taskRoutes from "./modules/tasks/tasks.route.js";
import payrollRoutes from "./modules/payroll/payroll.route.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);


app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payroll", payrollRoutes);
app.use(errorHandler);

export default app;
