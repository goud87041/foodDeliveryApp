import DeliveryBoy from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";

/**
 * Picks an idle/active partner (not on_delivery). Does not set on_delivery until they accept the offer.
 * @param {string} [excludeId] — skip this partner (e.g. after a reject)
 */
export async function assignDeliveryBoy(orderId, excludeId = null) {
  const ex = excludeId ? { _id: { $ne: excludeId } } : {};

  let boy = await DeliveryBoy.findOne({
    active: true,
    status: "idle",
    ...ex,
  }).sort({ updatedAt: 1 });

  if (!boy) {
    boy = await DeliveryBoy.findOne({
      active: true,
      status: "active",
      ...ex,
    }).sort({ updatedAt: 1 });
  }

  if (!boy) return null;

  const order = await Order.findById(orderId);
  if (order) {
    order.deliveryBoy = boy._id;
    order.deliveryResponse = "pending";
    order.deliveryLocation = {
      lat: boy.currentLocation?.lat,
      lng: boy.currentLocation?.lng,
    };
    await order.save();
  }

  return boy;
}

export async function releaseDeliveryBoyIfDone(deliveryBoyId) {
  if (!deliveryBoyId) return;
  const other = await Order.exists({
    deliveryBoy: deliveryBoyId,
    status: "out_for_delivery",
    deliveryResponse: "accepted",
  });
  if (!other) {
    await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, { status: "idle" });
  }
}
