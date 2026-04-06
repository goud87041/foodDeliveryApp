import mongoose from "mongoose";

export const REVIEW_TYPES = ["food", "delivery", "restaurant"];

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", default: null },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    type: { type: String, enum: REVIEW_TYPES, required: true },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, order: 1, type: 1, food: 1 });
reviewSchema.index({ deliveryBoy: 1 });

export default mongoose.model("Review", reviewSchema);
