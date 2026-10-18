import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerCompanyController,
  registerEmployeeController,
  createInviteController,
  getInviteStatusController,
} from "./auth.controller.js";
import { authorizeRole } from "../../middleware/role.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginController);
router.post("/register-company", registerCompanyController);
router.post("/register-employee", registerEmployeeController);
router.post("/invite", authMiddleware, authorizeRole("COMPANY_ADMIN", "SUPER_ADMIN"), createInviteController);
router.get("/invite/:token", getInviteStatusController);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);

export default router;
