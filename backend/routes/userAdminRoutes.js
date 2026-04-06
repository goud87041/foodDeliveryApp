import { Router } from "express";
import {
  listUsers,
  blockUser,
  unblockUser,
  listDeliveryBoys,
  createDeliveryBoy,
  listChefs,
  createChef,
  updateChef,
} from "../controllers/userAdminController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protectAdmin);

router.get("/users", listUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);

router.get("/delivery-boys", listDeliveryBoys);
router.post("/delivery-boys", createDeliveryBoy);

router.get("/chefs", listChefs);
router.post("/chefs", createChef);
router.patch("/chefs/:id", updateChef);

export default router;
