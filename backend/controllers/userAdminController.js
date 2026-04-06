import User from "../models/User.js";
import DeliveryBoy from "../models/DeliveryBoy.js";
import Chef from "../models/Chef.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ success: true, users });
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true }).select(
    "-password"
  );
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { new: true }).select(
    "-password"
  );
  if (!user) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, user });
});

export const listDeliveryBoys = asyncHandler(async (req, res) => {
  const boys = await DeliveryBoy.find().select("-password").sort({ createdAt: -1 });
  res.json({ success: true, deliveryBoys: boys });
});

export const createDeliveryBoy = asyncHandler(async (req, res) => {
  const boy = await DeliveryBoy.create(req.body);
  const out = boy.toObject();
  delete out.password;
  res.status(201).json({ success: true, deliveryBoy: out });
});

export const listChefs = asyncHandler(async (req, res) => {
  const chefs = await Chef.find().sort({ createdAt: -1 });
  res.json({ success: true, chefs });
});

export const createChef = asyncHandler(async (req, res) => {
  const chef = await Chef.create(req.body);
  res.status(201).json({ success: true, chef });
});

export const updateChef = asyncHandler(async (req, res) => {
  const chef = await Chef.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!chef) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, chef });
});
