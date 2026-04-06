import { Router } from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protectAdmin, adminDashboard);

export default router;
