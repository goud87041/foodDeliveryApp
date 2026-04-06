import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function getRazorpay() {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) return null;
  return new Razorpay({ key_id: key, key_secret: secret });
}

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const rp = getRazorpay();
  if (!rp) {
    /** Dev fallback: mark paid without gateway */
    order.paymentStatus = "paid";
    await order.save();
    return res.json({
      success: true,
      mock: true,
      message: "Razorpay keys not set — order marked paid for development.",
      order,
    });
  }

  const options = {
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order._id.toString().slice(0, 20),
  };

  const razorpayOrder = await rp.orders.create(options);
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: options.amount,
    currency: options.currency,
    razorpayOrderId: razorpayOrder.id,
    orderId: order._id,
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: req.user.id },
      { paymentStatus: "paid", razorpayPaymentId: "mock" },
      { new: true }
    );
    return res.json({ success: true, mock: true, order });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected !== razorpay_signature) {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, user: req.user.id, razorpayOrderId: razorpay_order_id },
    { paymentStatus: "paid", razorpayPaymentId: razorpay_payment_id },
    { new: true }
  );

  res.json({ success: true, order });
});
