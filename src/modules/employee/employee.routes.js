import express from "express";
import * as employeeController from "./employee.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "./employee.validation.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRole("COMPANY_ADMIN"),
  validateBody(createEmployeeSchema),
  employeeController.createEmployee,
);

router.get("/", authMiddleware, employeeController.getEmployees);
router.get("/:id", authMiddleware, employeeController.getEmployeeById);

router.put(
  "/:id",
  authMiddleware,
  authorizeRole("COMPANY_ADMIN"),
  validateBody(updateEmployeeSchema),
  employeeController.updateEmployee,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("COMPANY_ADMIN"),
  employeeController.deleteEmployee,
);
router.delete(
  "/",
  authMiddleware,
  authorizeRole("COMPANY_ADMIN"),
  employeeController.deleteAllEmployees,
);

export default router;
