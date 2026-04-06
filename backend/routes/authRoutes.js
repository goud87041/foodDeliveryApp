import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPasswordUser,
  resetPasswordUser,
} from "../controllers/authController.js";
import { protectUser } from "../middlewares/authMiddleware.js";
import { attachUserIfBlocked } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPasswordUser);
router.post("/reset-password", resetPasswordUser);

router.get("/me", protectUser, getMe);
router.put("/profile", protectUser, attachUserIfBlocked, updateProfile);

export default router;
