// const mongoose = require("mongoose");
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  aadhaarProof: {
    type: String,
    required: true,
  }, // S3/Cloudinary URL
  aadharNumber: {
    type: String,
    minLength: 12,
    maxLength:12,
    required: true,
  },
  locationProof: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  }, // Plan ID
  planExpiryDate: {
    type: Date,
    required: true,
  }, // Expiry Date of Plan
});

sellerSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      phone: this.phone,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

sellerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// const Admin = mongoose.model("Admin", sellerSchema);

export const Seller = mongoose.model("Seller", sellerSchema);
