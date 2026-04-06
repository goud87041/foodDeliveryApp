import User from "../models/User.js";
import { signToken } from "../utils/generateToken.js";
import { createResetToken } from "../utils/cryptoToken.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
  });
  const token = signToken({ sub: user._id.toString(), role: "user" });
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  if (user.blocked) {
    return res.status(403).json({ success: false, message: "Account is blocked" });
  }
  const token = signToken({ sub: user._id.toString(), role: "user" });
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      blocked: user.blocked,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { ...(name && { name }), ...(phone !== undefined && { phone }), ...(address && { address }) },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    },
  });
});

export const forgotPasswordUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: "If that email exists, reset instructions were sent." });
  }
  const token = createResetToken();
  const expires = Date.now() + 60 * 60 * 1000;
  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  await user.save({ validateBeforeSave: false });

  const base = req.body.resetUrlBase || process.env.USER_RESET_URL_BASE || "http://localhost:5173/reset-password";
  const link = `${base}?token=${token}&email=${encodeURIComponent(email)}`;
  await sendPasswordResetEmail(
    email,
    "Password reset",
    `<p>Reset your password using this link (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`
  );

  res.json({ success: true, message: "If that email exists, reset instructions were sent." });
});

export const resetPasswordUser = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password updated. You can log in now." });
});
