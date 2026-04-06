import Admin from "../models/Admin.js";
import { signToken } from "../utils/generateToken.js";
import { createResetToken } from "../utils/cryptoToken.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** Generate readable admin ID e.g. ADM-A1B2C3 */
function suggestAdminId() {
  const part = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ADM-${part}`;
}

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, adminId: requestedId } = req.body;
  const adminId = (requestedId || suggestAdminId()).toUpperCase().trim();

  const dup = await Admin.findOne({ $or: [{ email }, { adminId }] });
  if (dup) {
    return res.status(400).json({ success: false, message: "Email or Admin ID already in use" });
  }

  const admin = await Admin.create({ adminId, name, email, password });
  const token = signToken({
    sub: admin._id.toString(),
    role: "admin",
    adminId: admin.adminId,
  });
  res.status(201).json({
    success: true,
    token,
    admin: { id: admin._id, adminId: admin.adminId, name: admin.name, email: admin.email },
  });
});

/** Login ONLY with adminId + password */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { adminId, password } = req.body;
  const admin = await Admin.findOne({ adminId: adminId?.toUpperCase()?.trim() }).select("+password");
  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid Admin ID or password" });
  }
  const token = signToken({
    sub: admin._id.toString(),
    role: "admin",
    adminId: admin.adminId,
  });
  res.json({
    success: true,
    token,
    admin: { id: admin._id, adminId: admin.adminId, name: admin.name, email: admin.email },
  });
});

export const forgotPasswordAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.json({ success: true, message: "If that email exists, reset instructions were sent." });
  }
  const token = createResetToken();
  admin.resetPasswordToken = token;
  admin.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await admin.save({ validateBeforeSave: false });

  const base = req.body.resetUrlBase || process.env.ADMIN_RESET_URL_BASE || "http://localhost:5174/reset-password";
  const link = `${base}?token=${token}&email=${encodeURIComponent(email)}`;
  await sendPasswordResetEmail(
    email,
    "Admin password reset",
    `<p>Reset your admin password:</p><p><a href="${link}">${link}</a></p>`
  );

  res.json({ success: true, message: "If that email exists, reset instructions were sent." });
});

export const resetPasswordAdmin = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const admin = await Admin.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!admin) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
  admin.password = password;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  await admin.save();

  res.json({ success: true, message: "Password updated." });
});
