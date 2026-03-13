import express from "express";
import * as payrollController from "./payroll.controller.js";
import { generateMonthlyPayroll, getMonthlyReport } from "./payroll.helper.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import {
  createPayrollSchema,
  updatePayrollSchema,
} from "./payroll.validation.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateBody(createPayrollSchema),
  payrollController.createPayroll,
);

router.get("/", authMiddleware, payrollController.getPayrolls);

router.get("/my", authMiddleware, payrollController.getMyPayrolls);

router.get(
  "/employee/:employeeId",
  authMiddleware,
  payrollController.getEmployeePayrolls,
);
router.post(
  "/generate/:month/:year",
  authMiddleware,
  authorizeRole("ADMIN"),
  async (req, res, next) => {
    try {
      const payrolls = await generateMonthlyPayroll(
        parseInt(req.params.month),
        parseInt(req.params.year),
        req.user.id,
      );
      res.json({ success: true, data: payrolls });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/report/:month/:year",
  authMiddleware,
  authorizeRole("ADMIN"),
  async (req, res, next) => {
    try {
      const report = await getMonthlyReport(
        parseInt(req.params.month),
        parseInt(req.params.year),
      );
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/:id", authMiddleware, payrollController.getPayrollById);

router.put(
  "/:id",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateBody(updatePayrollSchema),
  payrollController.updatePayroll,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("ADMIN"),
  payrollController.deletePayroll,
);

export default router;
