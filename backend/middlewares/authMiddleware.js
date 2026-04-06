import { verifyToken } from "../utils/generateToken.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

function getBearerToken(req) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7);
}

export function protectUser(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const decoded = verifyToken(token);
    if (decoded.role !== "user") {
      return res.status(403).json({ success: false, message: "User access only" });
    }
    req.user = { id: decoded.sub, role: "user" };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function protectAdmin(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const decoded = verifyToken(token);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    req.admin = { id: decoded.sub, role: "admin", adminId: decoded.adminId };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function protectDelivery(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const decoded = verifyToken(token);
    if (decoded.role !== "delivery_boy") {
      return res.status(403).json({ success: false, message: "Delivery access only" });
    }
    req.deliveryBoy = { id: decoded.sub, role: "delivery_boy" };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/** Load full user doc when needed (e.g. blocked check) */
export async function attachUserIfBlocked(req, res, next) {
  try {
    const u = await User.findById(req.user.id);
    if (!u || u.blocked) {
      return res.status(403).json({ success: false, message: "Account blocked or not found" });
    }
    req.userDoc = u;
    next();
  } catch (e) {
    next(e);
  }
}
