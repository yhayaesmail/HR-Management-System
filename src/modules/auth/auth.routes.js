import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
} from "./auth.controller.js";

const router = Router();

router.post("/login", loginController);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);

export default router;
