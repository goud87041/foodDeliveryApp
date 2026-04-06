import { Router } from "express";
import { loginDeliveryBoy, registerDeliveryBoy, updateDeliveryLocation } from "../controllers/deliveryAuthController.js";
import {
  listMyDeliveryOrders,
  getMyDeliveryOrder,
  acceptDeliveryOrder,
  rejectDeliveryOrder,
} from "../controllers/deliveryOrderController.js";
import { protectDelivery } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerDeliveryBoy);
router.post("/login", loginDeliveryBoy);
router.patch("/location", protectDelivery, updateDeliveryLocation);

router.get("/orders", protectDelivery, listMyDeliveryOrders);
router.get("/orders/:id", protectDelivery, getMyDeliveryOrder);
router.post("/orders/:id/accept", protectDelivery, acceptDeliveryOrder);
router.post("/orders/:id/reject", protectDelivery, rejectDeliveryOrder);

export default router;
