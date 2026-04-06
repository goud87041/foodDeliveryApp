import { Router } from "express";
import { listFoods, getFood } from "../controllers/foodController.js";

const router = Router();

router.get("/", listFoods);
router.get("/:id", getFood);

export default router;
