// const jwt = require("jsonwebtoken");
// const redisClient = require("../config/redisClient");
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
// import redisClient from "../config/redisClient";


dotenv.config()
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "defaultsecret";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken ||req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    // Ensure Redis is connected before checking the blacklist
    // const redisStatus = await redisClient.ping();
    // if (redisStatus !== "PONG") {
    //   console.error("Redis is not connected.");
    //   return res.status(500).json({ message: "Server error. Please try again later." });
    // }

    // // Check if the token is blacklisted
    // const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    // if (isBlacklisted) {
    //   return res.status(401).json({ message: "Session expired. Please log in again." });
    // }

    // Verify JWT Token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    // req.token = token;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

export default authMiddleware
