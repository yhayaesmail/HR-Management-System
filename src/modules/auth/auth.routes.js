import { Router } from "express";
import { loginController, refreshTokenController } from "./auth.controller.js";



const router = Router();

router.post('/login',loginController);
router.post('/refresh',refreshTokenController);

export default router;
