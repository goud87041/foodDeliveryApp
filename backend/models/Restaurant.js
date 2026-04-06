import mongoose from "mongoose";

/**
 * Single default restaurant; restaurant-type reviews update avgRating / totalReviews.
 */
const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Main Kitchen" },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
