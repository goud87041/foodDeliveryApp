import Review from "../models/Review.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

async function getOrCreateRestaurant() {
  let r = await Restaurant.findOne();
  if (!r) {
    r = await Restaurant.create({ name: "Main Kitchen" });
  }
  return r;
}

/** Recompute food average from all food-type reviews for that foodId */
export async function refreshFoodRating(foodId) {
  if (!foodId) return;
  const agg = await Review.aggregate([
    { $match: { type: "food", food: foodId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;
  await Food.findByIdAndUpdate(foodId, {
    avgRating: Math.round(avg * 10) / 10,
    totalReviews: count,
  });
}

/** Recompute restaurant aggregate from type restaurant */
export async function refreshRestaurantRating() {
  const agg = await Review.aggregate([
    { $match: { type: "restaurant" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;
  const restaurant = await getOrCreateRestaurant();
  restaurant.avgRating = Math.round(avg * 10) / 10;
  restaurant.totalReviews = count;
  await restaurant.save();
}

/** Optional: store avg on delivery boy for admin analytics */
export async function refreshDeliveryBoyRating(deliveryBoyId) {
  if (!deliveryBoyId) return;
  const agg = await Review.aggregate([
    { $match: { type: "delivery", deliveryBoy: deliveryBoyId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  // We keep ratings only in Review model; admin can aggregate. Optionally embed:
  await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, {
    $set: {
      deliveryAvgRating: Math.round((agg[0]?.avg ?? 0) * 10) / 10,
      deliveryReviewCount: agg[0]?.count ?? 0,
    },
  });
}
