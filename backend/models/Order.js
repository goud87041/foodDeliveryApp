import mongoose from "mongoose";

export const ORDER_STATUSES = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];

const orderItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    address: {
      line1: { type: String, required: true },
      city: String,
      pincode: String,
    },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    totalAmount: { type: Number, required: true, min: 0 },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: "Chef", default: null },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy", default: null },
    /** Partner must accept before starting delivery; null when unassigned */
    deliveryResponse: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: null,
    },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    /** Simple location simulation while out for delivery */
    deliveryLocation: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
