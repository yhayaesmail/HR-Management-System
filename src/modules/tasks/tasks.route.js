import express from "express";
import * as taskController from "./tasks.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  changeStatusSchema,
} from "./tasks.validation.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateBody(createTaskSchema),
  taskController.createTask,
);

router.get(
  "/",
  authMiddleware,
  authorizeRole("ADMIN"),
  taskController.getAllTasks,
);

router.get("/my", authMiddleware, taskController.getMyTasks);

router.get(
  "/employee/:employeeId",
  authMiddleware,
  authorizeRole("ADMIN"),
  taskController.getEmployeeTasks,
);

router.get("/:id", authMiddleware, taskController.getTaskById);

router.put(
  "/:id",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateBody(updateTaskSchema),
  taskController.updateTask,
);

router.patch(
  "/:id/status",
  authMiddleware,
  validateBody(changeStatusSchema),
  taskController.changeTaskStatus,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("ADMIN"),
  taskController.deleteTask,
);

export default router;
