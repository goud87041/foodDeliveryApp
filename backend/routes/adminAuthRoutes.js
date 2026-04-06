import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  forgotPasswordAdmin,
  resetPasswordAdmin,
} from "../controllers/adminAuthController.js";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPasswordAdmin);
router.post("/reset-password", resetPasswordAdmin);

export default router;
