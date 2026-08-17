import express from "express";
import * as hiringController from "./hiring.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/role.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validate.middleware.js";
import {
  receiveApplicationSchema,
  proccessApplicationSchema,
  applicationParamsSchema,
  getApplicationsQuerySchema,
} from "./Hiring.validation.js";

const router = express.Router();

router.post(
  "/",
  validateBody(receiveApplicationSchema),
  hiringController.receiveApplications,
);

router.get(
  "/",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateQuery(getApplicationsQuerySchema),
  hiringController.getApplications,
);

router.get(
  "/:email",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateParams(applicationParamsSchema),
  hiringController.getApplicationById,
);

router.patch(
  "/:email",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateParams(applicationParamsSchema),
  validateBody(proccessApplicationSchema),
  hiringController.proccessApplication,
);

router.delete(
  "/:email",
  authMiddleware,
  authorizeRole("ADMIN"),
  validateParams(applicationParamsSchema),
  hiringController.deleteApplication,
);

export default router;
