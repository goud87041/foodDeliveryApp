import { Router } from "express";
import {
  createReview,
  listReviews,
  listReviewsPublic,
  listMyReviewsForOrder,
  getReview,
  updateReview,
  deleteReview,
  reviewAggregates,
} from "../controllers/reviewController.js";
import { protectUser, protectAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/public", listReviewsPublic);
router.get("/aggregates", reviewAggregates);
router.get("/order/:orderId", protectUser, listMyReviewsForOrder);
router.get("/:id", getReview);

router.post("/", protectUser, createReview);
router.put("/:id", protectUser, updateReview);
router.delete("/:id", protectUser, deleteReview);

const adminRouter = Router();
adminRouter.use(protectAdmin);
adminRouter.get("/", listReviews);
adminRouter.delete("/:id", deleteReview);

export { adminRouter as reviewAdminRoutes };
export default router;
