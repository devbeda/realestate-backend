require("dotenv").config();
const mongoose = require("mongoose");
const Plan = require("./src/models/Plan");
const connectDB = require("./src/config/db");


const seedPlans = async () => {
  await connectDB(); // Connect to MongoDB

  const plans = [
    {
      name: "Free",
      price: 0,
      renewalPrice: 1000, // 50% of INR 2000
      propertiesLimit: 2,
      duration: 100, // 100 days
    },
    {
      name: "Silver",
      price: 2000,
      renewalPrice: 1000,
      propertiesLimit: 5,
      duration: 365, // 1 year
    },
    {
      name: "Gold",
      price: 3000,
      renewalPrice: 1500,
      propertiesLimit: 10,
      duration: 365, // 1 year
    },
  ];

  try {
    await Plan.deleteMany(); // Remove existing plans
    await Plan.insertMany(plans); // Insert new plans
    console.log("✅ Seller plans seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();
