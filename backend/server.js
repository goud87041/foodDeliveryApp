import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Order from "./models/Order.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import adminFoodRoutes from "./routes/adminFoodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userAdminRoutes from "./routes/userAdminRoutes.js";
import reviewRoutes, { reviewAdminRoutes } from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const httpServer = createServer(app);

const origins = (process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const io = new Server(httpServer, {
  cors: { origin: origins, methods: ["GET", "POST"] },
});

app.set("io", io);

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);
app.use(express.json());

/** Uploaded food images (public read) */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/** Health check */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "food-delivery-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/admin/foods", adminFoodRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", userAdminRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/reviews", reviewAdminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/delivery", deliveryRoutes);

app.use(notFound);
app.use(errorHandler);

/** Socket.io — rooms per user for targeted order updates */
io.on("connection", (socket) => {
  socket.on("join:user", (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });
  socket.on("join:admin", () => {
    socket.join("admin");
  });
  socket.on("join:delivery", (deliveryBoyId) => {
    if (deliveryBoyId) socket.join(`deliveryBoy:${deliveryBoyId}`);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fooddelivery";

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await Order.updateMany(
      { status: "out_for_delivery", deliveryBoy: { $ne: null }, deliveryResponse: null },
      { $set: { deliveryResponse: "accepted" } }
    );
    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
