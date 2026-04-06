import Order from "../models/Order.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Restaurant from "../models/Restaurant.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminDashboard = asyncHandler(async (req, res) => {
  const [totalOrders, activeOrders, completed, revenueAgg, userCount, reviewStats, restaurant] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending", "preparing", "out_for_delivery"] } }),
      Order.countDocuments({ status: "delivered" }),
      Order.aggregate([
        { $match: { status: "delivered", paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      User.countDocuments(),
      Review.aggregate([
        {
          $group: {
            _id: "$type",
            avg: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
      Restaurant.findOne(),
    ]);

  const revenue = revenueAgg[0]?.total ?? 0;

  /** Last 7 days order counts for simple chart */
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const ordersByDay = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      activeOrders,
      completedOrders: completed,
      revenue: Math.round(revenue * 100) / 100,
      users: userCount,
      restaurantRating: restaurant?.avgRating ?? 0,
      restaurantReviews: restaurant?.totalReviews ?? 0,
      reviewBreakdown: reviewStats,
    },
    ordersByDay,
  });
});
