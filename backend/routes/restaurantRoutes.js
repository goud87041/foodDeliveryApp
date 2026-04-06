import { Router } from "express";
import { getRestaurant } from "../controllers/restaurantController.js";

const router = Router();

router.get("/", getRestaurant);

export default router;
