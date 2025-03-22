import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";

import bodyParser from "body-parser";

import adminRoute from "./src/routes/admin.routes.js"
import userRoute from "./src/routes/user.routers.js"
import sellerRoutes from "./src/routes/seller.routes.js"
import planRoutes from "./src/routes/plan.route.js"

// import redisClient from "./src/config/redisClient.js";

dotenv.config()



// // Import Routes
// const authRoutes = require("./src/routes/authRoutes.js");
// const planRoutes = require("./src/routes/planRoutes.js");
// const sellerRoutes = require("./src/routes/sellerRoutes.js"); // ✅ Import sellerRoutes

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(bodyParser.json());


app.use(cookieParser());



// Routes
app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);
app.use("/api/plan", planRoutes)
app.use("/api/seller", sellerRoutes); // ✅ Now it will work

const PORT = process.env.PORT || 5001;

// Start Server
connectDB()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
}).catch((err) => {
  console.error(err);
  process.exit(1);
})
