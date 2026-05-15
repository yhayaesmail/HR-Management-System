import express from "express";
import {
  checkInController,
  checkOutController,
  getEmployeeAttendanceController,
  getMyAttendanceController,
  getTodayAttendanceController,
} from "./Attendance.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validate.middleware.js";
import {
  checkInSchema,
  checkOutSchema,
  getEmployeeAttendanceSchema,
} from "./Attendance.validation.js";

const router = express.Router();

router.post(
  "/check-in",
  authMiddleware,
  validateBody(checkInSchema),
  checkInController,
);
router.post(
  "/check-out",
  authMiddleware,
  validateBody(checkOutSchema),
  checkOutController,
);

router.get(
  "/my",
  authMiddleware,
  validateQuery(getEmployeeAttendanceSchema),
  getMyAttendanceController,
);

router.get(
  "/employee/:id",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateQuery(getEmployeeAttendanceSchema),
  getEmployeeAttendanceController,
);

router.get(
  "/today",
  authMiddleware,
  authorizeRole("ADMIN"),
  getTodayAttendanceController,
);

export default router;
