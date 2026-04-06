import { Router } from "express";
import { listFoodsAdmin, createFood, updateFood, deleteFood } from "../controllers/foodController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protectAdmin);
router.get("/", listFoodsAdmin);
router.post("/", createFood);
router.put("/:id", updateFood);
router.delete("/:id", deleteFood);

export default router;
