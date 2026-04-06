import { Router } from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/paymentController.js";
import { protectUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/razorpay/create-order", protectUser, createRazorpayOrder);
router.post("/razorpay/verify", protectUser, verifyRazorpayPayment);

export default router;
