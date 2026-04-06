import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Chef from "../models/Chef.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assignDeliveryBoy, releaseDeliveryBoyIfDone } from "../services/deliveryAssignment.js";

function emitOrder(io, order, event = "order:updated") {
  if (!io || !order) return;
  const payload = { orderId: order._id.toString(), status: order.status, order };
  io.emit(event, payload);
  io.to(`user:${order.user}`).emit(event, payload);
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, address } = req.body;
  if (!items?.length) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  let total = 0;
  const lineItems = [];
  for (const line of items) {
    const food = await Food.findById(line.foodId);
    if (!food || !food.available) {
      return res.status(400).json({ success: false, message: `Invalid or unavailable item: ${line.foodId}` });
    }
    const qty = Math.max(1, Number(line.quantity) || 1);
    const price = food.price;
    total += price * qty;
    lineItems.push({
      food: food._id,
      quantity: qty,
      price,
      name: food.name,
    });
  }

  const chefs = await Chef.find({ active: true });
  const chef = chefs.length ? chefs[Math.floor(Math.random() * chefs.length)] : null;

  const order = await Order.create({
    user: req.user.id,
    items: lineItems,
    address: {
      line1: address?.line1 || req.userDoc?.address?.line1 || "",
      city: address?.city || req.userDoc?.address?.city,
      pincode: address?.pincode || req.userDoc?.address?.pincode,
    },
    totalAmount: total,
    chef: chef?._id || null,
    status: "pending",
  });

  const populated = await Order.findById(order._id)
    .populate("items.food")
    .populate("chef")
    .populate("deliveryBoy");

  const io = req.app.get("io");
  emitOrder(io, populated, "order:created");

  res.status(201).json({ success: true, order: populated });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate("items.food")
    .populate("chef")
    .populate("deliveryBoy");
  res.json({ success: true, orders });
});

export const getOrderUser = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
    .populate("items.food")
    .populate("chef")
    .populate("deliveryBoy");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, order });
});

export const listOrdersAdmin = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const q = {};
  if (status) q.status = status;
  const orders = await Order.find(q)
    .sort({ createdAt: -1 })
    .populate("user", "name email phone")
    .populate("items.food")
    .populate("chef")
    .populate("deliveryBoy");
  res.json({ success: true, orders });
});

export const getOrderAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone address blocked")
    .populate("items.food")
    .populate("chef")
    .populate("deliveryBoy");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const prevBoy = order.deliveryBoy?.toString();
  const prevStatus = order.status;

  if (status === "out_for_delivery" && !order.deliveryBoy) {
    const boy = await assignDeliveryBoy(order._id);
    if (!boy) {
      return res.status(400).json({
        success: false,
        message: "No delivery partner available. Add an active delivery boy in the system.",
      });
    }
    order.deliveryBoy = boy._id;
    order.deliveryLocation = {
      lat: boy.currentLocation?.lat,
      lng: boy.currentLocation?.lng,
    };
  }

  if (prevStatus === "out_for_delivery" && status === "delivered") {
    await releaseDeliveryBoyIfDone(order.deliveryBoy);
  }

  if (status === "cancelled" && order.deliveryBoy) {
    await releaseDeliveryBoyIfDone(order.deliveryBoy);
  }

  order.status = status;
  await order.save();

  const populated = await Order.findById(order._id)
    .populate("user", "name email")
    .populate("items.food")
    .populate("chef")
    .populate("deliveryBoy");

  const io = req.app.get("io");
  emitOrder(io, populated);

  if (status === "out_for_delivery" && populated.deliveryBoy && populated.deliveryResponse === "pending") {
    const bid = populated.deliveryBoy._id
      ? populated.deliveryBoy._id.toString()
      : populated.deliveryBoy.toString();
    io?.to(`deliveryBoy:${bid}`).emit("delivery:offer", { orderId: populated._id.toString() });
  }

  res.json({ success: true, order: populated });
});

export const assignChefToOrder = asyncHandler(async (req, res) => {
  const { chefId } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { chef: chefId || null },
    { new: true }
  )
    .populate("chef")
    .populate("items.food")
    .populate("deliveryBoy");

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  const io = req.app.get("io");
  emitOrder(io, order);
  res.json({ success: true, order });
});
