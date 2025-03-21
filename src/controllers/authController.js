const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redisClient");

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";
const JWT_EXPIRES_IN = "7d"; // JWT Expiry (7 days)

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    // Validate input
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields (name, phone, password, role) are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with role
    const user = new User({ name, phone, password: hashedPassword, role });
    await user.save();

    console.log("✅ User registered:", { id: user._id, name: user.name, phone: user.phone, role: user.role });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT with role
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    console.log("✅ User logged in:", { id: user._id, phone: user.phone, role: user.role });

    res.status(200).json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout User
exports.logoutUser = async (req, res) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const expiresIn = 7 * 24 * 60 * 60; // 7 days
    await redisClient.setEx(`blacklist_${token}`, expiresIn, "blacklisted");

    console.log("✅ Token blacklisted:", token);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
