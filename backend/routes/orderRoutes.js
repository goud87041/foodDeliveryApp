import { Router } from "express";
import {
  createOrder,
  myOrders,
  getOrderUser,
  listOrdersAdmin,
  getOrderAdmin,
  updateOrderStatus,
  assignChefToOrder,
} from "../controllers/orderController.js";
import { protectUser, protectAdmin } from "../middlewares/authMiddleware.js";
import { attachUserIfBlocked } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protectUser, attachUserIfBlocked, createOrder);
router.get("/mine", protectUser, myOrders);
router.get("/mine/:id", protectUser, getOrderUser);

router.get("/admin/all", protectAdmin, listOrdersAdmin);
router.get("/admin/:id", protectAdmin, getOrderAdmin);
router.patch("/admin/:id/status", protectAdmin, updateOrderStatus);
router.patch("/admin/:id/chef", protectAdmin, assignChefToOrder);

export default router;
