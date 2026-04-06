import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/** Status for live tracking in admin panel */
export const DELIVERY_STATUSES = ["idle", "active", "on_delivery"];

const deliveryBoySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, default: "" },
    status: { type: String, enum: DELIVERY_STATUSES, default: "idle" },
    currentLocation: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
    },
    active: { type: Boolean, default: true },
    /** Denormalized from delivery-type reviews */
    deliveryAvgRating: { type: Number, default: 0 },
    deliveryReviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deliveryBoySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

deliveryBoySchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("DeliveryBoy", deliveryBoySchema);
