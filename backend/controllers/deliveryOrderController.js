import Order from "../models/Order.js";
import DeliveryBoy from "../models/DeliveryBoy.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assignDeliveryBoy } from "../services/deliveryAssignment.js";

function emitOrder(io, order) {
  if (!io || !order) return;
  const payload = { orderId: order._id.toString(), status: order.status, order };
  io.emit("order:updated", payload);
  const uid = order.user?._id || order.user;
  if (uid) io.to(`user:${String(uid)}`).emit("order:updated", payload);
}

function normalizeResponse(order) {
  const o = order.toObject ? order.toObject() : order;
  if (o.status === "out_for_delivery" && o.deliveryBoy && (o.deliveryResponse == null || o.deliveryResponse === undefined)) {
    o.deliveryResponse = "accepted";
  }
  return o;
}

const populateOrder = [
  { path: "user", select: "name email phone address" },
  { path: "items.food", select: "name price image" },
  { path: "chef", select: "name" },
  { path: "deliveryBoy", select: "name phone email status" },
];

export const listMyDeliveryOrders = asyncHandler(async (req, res) => {
  const id = req.deliveryBoy.id;
  const orders = await Order.find({
    deliveryBoy: id,
    status: "out_for_delivery",
  })
    .sort({ updatedAt: -1 })
    .populate(populateOrder);

  res.json({
    success: true,
    orders: orders.map((o) => normalizeResponse(o)),
  });
});

export const getMyDeliveryOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    deliveryBoy: req.deliveryBoy.id,
    status: "out_for_delivery",
  }).populate(populateOrder);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, order: normalizeResponse(order) });
});

export const acceptDeliveryOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    deliveryBoy: req.deliveryBoy.id,
    status: "out_for_delivery",
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.deliveryResponse === "accepted") {
    const populated = await Order.findById(order._id).populate(populateOrder);
    return res.json({ success: true, order: normalizeResponse(populated) });
  }

  if (order.deliveryResponse !== "pending") {
    return res.status(400).json({ success: false, message: "No pending offer for this order" });
  }

  order.deliveryResponse = "accepted";
  const boy = await DeliveryBoy.findById(req.deliveryBoy.id);
  if (boy) {
    boy.status = "on_delivery";
    await boy.save();
  }
  await order.save();

  const populated = await Order.findById(order._id).populate(populateOrder);
  const io = req.app.get("io");
  emitOrder(io, populated);
  io?.to(`deliveryBoy:${req.deliveryBoy.id}`).emit("delivery:accepted", { orderId: order._id.toString() });

  res.json({ success: true, order: normalizeResponse(populated) });
});

export const rejectDeliveryOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    deliveryBoy: req.deliveryBoy.id,
    status: "out_for_delivery",
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const resp = order.deliveryResponse;
  if (resp !== "pending") {
    return res.status(400).json({ success: false, message: "Only pending offers can be rejected" });
  }

  const rejectedBoyId = order.deliveryBoy;
  order.deliveryBoy = null;
  order.deliveryResponse = null;
  order.deliveryLocation = undefined;
  await order.save();

  const nextBoy = await assignDeliveryBoy(order._id, rejectedBoyId?.toString());

  const populated = await Order.findById(order._id).populate(populateOrder);
  const io = req.app.get("io");
  emitOrder(io, populated);

  if (nextBoy) {
    io?.to(`deliveryBoy:${nextBoy._id}`).emit("delivery:offer", { orderId: order._id.toString() });
  }

  res.json({
    success: true,
    message: nextBoy ? "Offer passed to another partner" : "No other partner available — admin may need to reassign",
    order: populated ? normalizeResponse(populated) : null,
    reassigned: !!nextBoy,
  });
});
