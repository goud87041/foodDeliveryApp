import Restaurant from "../models/Restaurant.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getRestaurant = asyncHandler(async (req, res) => {
  let r = await Restaurant.findOne();
  if (!r) {
    r = await Restaurant.create({ name: "Main Kitchen" });
  }
  res.json({ success: true, restaurant: r });
});
