import Food from "../models/Food.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listFoods = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const q = { available: true };
  if (category) q.category = category;
  if (search) {
    q.$or = [
      { name: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }
  const foods = await Food.find(q).sort({ createdAt: -1 });
  res.json({ success: true, foods });
});

export const listFoodsAdmin = asyncHandler(async (req, res) => {
  const foods = await Food.find().sort({ createdAt: -1 });
  res.json({ success: true, foods });
});

export const getFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ success: false, message: "Food not found" });
  res.json({ success: true, food });
});

export const createFood = asyncHandler(async (req, res) => {
  const food = await Food.create(req.body);
  res.status(201).json({ success: true, food });
});

export const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!food) return res.status(404).json({ success: false, message: "Food not found" });
  res.json({ success: true, food });
});

export const deleteFood = asyncHandler(async (req, res) => {
  await Food.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
