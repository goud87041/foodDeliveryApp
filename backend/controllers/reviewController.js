import Review from "../models/Review.js";
import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  refreshFoodRating,
  refreshRestaurantRating,
  refreshDeliveryBoyRating,
} from "../services/ratingService.js";

export const createReview = asyncHandler(async (req, res) => {
  const { orderId, foodId, deliveryBoyId, rating, comment, type } = req.body;

  if (!["food", "delivery", "restaurant"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid review type" });
  }

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order || order.status !== "delivered") {
    return res.status(400).json({ success: false, message: "You can only review delivered orders" });
  }

  if (type === "food" && !foodId) {
    return res.status(400).json({ success: false, message: "foodId required for food reviews" });
  }
  if (type === "delivery") {
    const oid = order.deliveryBoy?.toString();
    if (!oid) {
      return res.status(400).json({ success: false, message: "No delivery assigned for this order" });
    }
  }

  const dupFilter = { user: req.user.id, order: orderId, type };
  if (type === "food") dupFilter.food = foodId;

  const exists = await Review.findOne(dupFilter);
  if (exists) {
    return res.status(400).json({ success: false, message: "Review already exists for this item" });
  }

  const doc = {
    user: req.user.id,
    order: orderId,
    rating: Number(rating),
    comment: comment || "",
    type,
  };

  if (type === "food") doc.food = foodId;
  if (type === "delivery") {
    doc.deliveryBoy = order.deliveryBoy;
  }

  const review = await Review.create(doc);
  const populated = await Review.findById(review._id)
    .populate("user", "name")
    .populate("food")
    .populate("deliveryBoy", "name")
    .populate("order");

  if (type === "food") await refreshFoodRating(foodId);
  if (type === "restaurant") await refreshRestaurantRating();
  if (type === "delivery" && doc.deliveryBoy) await refreshDeliveryBoyRating(doc.deliveryBoy);

  const io = req.app.get("io");
  io?.emit("review:created", { review: populated });

  res.status(201).json({ success: true, review: populated });
});

export const listReviews = asyncHandler(async (req, res) => {
  const { type, foodId, deliveryBoyId, restaurant } = req.query;
  const q = {};
  if (type) q.type = type;
  if (foodId) q.food = foodId;
  if (deliveryBoyId) q.deliveryBoy = deliveryBoyId;
  /** "Restaurant" reviews are type=restaurant */
  if (restaurant === "true") q.type = "restaurant";

  const reviews = await Review.find(q)
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("food")
    .populate("deliveryBoy", "name")
    .populate("order");

  res.json({ success: true, reviews });
});

export const listReviewsPublic = asyncHandler(async (req, res) => {
  const { foodId, type, orderId } = req.query;
  const q = {};
  if (foodId) q.food = foodId;
  if (type) q.type = type;
  if (orderId) q.order = orderId;
  const reviews = await Review.find(q)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("user", "name")
    .populate("food");
  res.json({ success: true, reviews });
});

/** Current user's reviews for a specific order (for UI state after delivery) */
export const listMyReviewsForOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  const reviews = await Review.find({ order: req.params.orderId, user: req.user.id })
    .populate("food")
    .populate("deliveryBoy", "name");
  res.json({ success: true, reviews });
});

export const getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "name")
    .populate("food")
    .populate("deliveryBoy")
    .populate("order");
  if (!review) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, review });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Not found" });
  if (review.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "Not your review" });
  }

  const prevType = review.type;
  const prevFood = review.food?.toString();
  const prevBoy = review.deliveryBoy?.toString();

  if (req.body.rating != null) review.rating = Number(req.body.rating);
  if (req.body.comment != null) review.comment = req.body.comment;
  await review.save();

  const populated = await Review.findById(review._id)
    .populate("user", "name")
    .populate("food")
    .populate("deliveryBoy")
    .populate("order");

  if (prevType === "food" && prevFood) await refreshFoodRating(prevFood);
  if (prevType === "restaurant") await refreshRestaurantRating();
  if (prevType === "delivery" && prevBoy) await refreshDeliveryBoyRating(prevBoy);

  res.json({ success: true, review: populated });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Not found" });

  const isAdmin = req.admin;
  const isOwner = review.user.toString() === req.user?.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const prevType = review.type;
  const prevFood = review.food?.toString();
  const prevBoy = review.deliveryBoy?.toString();

  await review.deleteOne();

  if (prevType === "food" && prevFood) await refreshFoodRating(prevFood);
  if (prevType === "restaurant") await refreshRestaurantRating();
  if (prevType === "delivery" && prevBoy) await refreshDeliveryBoyRating(prevBoy);

  res.json({ success: true, message: "Deleted" });
});

export const reviewAggregates = asyncHandler(async (req, res) => {
  const [food, delivery, restaurant] = await Promise.all([
    Review.aggregate([
      { $match: { type: "food" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: { type: "delivery" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: { type: "restaurant" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    averages: {
      food: { avg: Math.round((food[0]?.avg ?? 0) * 10) / 10, count: food[0]?.count ?? 0 },
      delivery: {
        avg: Math.round((delivery[0]?.avg ?? 0) * 10) / 10,
        count: delivery[0]?.count ?? 0,
      },
      restaurant: {
        avg: Math.round((restaurant[0]?.avg ?? 0) * 10) / 10,
        count: restaurant[0]?.count ?? 0,
      },
    },
  });
});
