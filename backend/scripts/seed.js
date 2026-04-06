/**
 * Seed sample data: restaurant, admin, chefs, delivery boys, foods.
 * Run: npm run seed (from backend folder)
 */
import "dotenv/config";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Chef from "../models/Chef.js";
import DeliveryBoy from "../models/DeliveryBoy.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fooddelivery";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected");

  await Restaurant.findOneAndUpdate(
    {},
    { name: "Main Kitchen", avgRating: 0, totalReviews: 0 },
    { upsert: true, new: true }
  );

  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({
      adminId: "ADM-DEMO",
      name: "Demo Admin",
      email: "admin@demo.com",
      password: "admin123",
    });
    console.log("Admin created: adminId=ADM-DEMO password=admin123");
  }

  if ((await Chef.countDocuments()) === 0) {
    await Chef.insertMany([
      { name: "Chef Rahul", email: "rahul@kitchen.com", active: true },
      { name: "Chef Priya", email: "priya@kitchen.com", active: true },
    ]);
    console.log("Chefs seeded");
  }

  if ((await DeliveryBoy.countDocuments()) === 0) {
    await DeliveryBoy.create({
      name: "Vikram Singh",
      email: "vikram@delivery.com",
      password: "delivery123",
      phone: "9000000001",
      status: "idle",
      currentLocation: { lat: 12.9716, lng: 77.5946 },
      active: true,
    });
    await DeliveryBoy.create({
      name: "Amit Kumar",
      email: "amit@delivery.com",
      password: "delivery123",
      phone: "9000000002",
      status: "idle",
      currentLocation: { lat: 12.9352, lng: 77.6245 },
      active: true,
    });
    console.log("Delivery boys seeded (password: delivery123)");
  }

  if ((await Food.countDocuments()) === 0) {
    await Food.insertMany([
      {
        name: "Margherita Pizza",
        description: "Classic tomato, mozzarella, and basil",
        price: 299,
        category: "Pizza",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
        available: true,
      },
      {
        name: "Paneer Tikka Burger",
        description: "Grilled paneer with mint chutney",
        price: 189,
        category: "Burger",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        available: true,
      },
      {
        name: "Masala Dosa",
        description: "Crispy dosa with spiced potato filling",
        price: 120,
        category: "South Indian",
        image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400",
        available: true,
      },
      {
        name: "Chocolate Brownie",
        description: "Warm brownie with vanilla ice cream",
        price: 149,
        category: "Dessert",
        image: "https://images.unsplash.com/photo-1607920592923-c01b4d4e6c7a?w=400",
        available: true,
      },
    ]);
    console.log("Foods seeded");
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
