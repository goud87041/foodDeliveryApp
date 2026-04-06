import DeliveryBoy from "../models/DeliveryBoy.js";
import { signToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerDeliveryBoy = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  const existing = await DeliveryBoy.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const boy = await DeliveryBoy.create({
    name,
    email,
    password,
    phone,
  });

  const token = signToken({ sub: boy._id.toString(), role: "delivery_boy" });
  
  res.status(201).json({
    success: true,
    token,
    deliveryBoy: {
      id: boy._id,
      name: boy.name,
      email: boy.email,
      status: boy.status,
      currentLocation: boy.currentLocation,
    },
  });
});

export const loginDeliveryBoy = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const boy = await DeliveryBoy.findOne({ email }).select("+password");
  if (!boy || !boy.active || !(await boy.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  const token = signToken({ sub: boy._id.toString(), role: "delivery_boy" });
  res.json({
    success: true,
    token,
    deliveryBoy: {
      id: boy._id,
      name: boy.name,
      email: boy.email,
      status: boy.status,
      currentLocation: boy.currentLocation,
    },
  });
});

export const updateDeliveryLocation = asyncHandler(async (req, res) => {
  const { lat, lng, status } = req.body;
  const boy = await DeliveryBoy.findById(req.deliveryBoy.id);
  if (!boy) return res.status(404).json({ success: false, message: "Not found" });
  if (lat != null && lng != null) {
    boy.currentLocation = { lat, lng };
  }
  if (status && ["idle", "active", "on_delivery"].includes(status)) {
    boy.status = status;
  }
  await boy.save();

  const io = req.app.get("io");
  io?.emit("delivery:location", {
    deliveryBoyId: boy._id.toString(),
    lat: boy.currentLocation.lat,
    lng: boy.currentLocation.lng,
    status: boy.status,
  });

  res.json({
    success: true,
    deliveryBoy: {
      id: boy._id,
      status: boy.status,
      currentLocation: boy.currentLocation,
    },
  });
});
